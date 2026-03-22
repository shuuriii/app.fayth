// supabase/functions/daily-checkin-batch — Generates daily Fay check-ins for all eligible patients
// Triggered by pg_cron via pg_net (daily at 9am IST). Auth via service role key header.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Types ──────────────────────────────────────────────────────────

interface DayScore {
  date: string;
  focus_score: number;
  mood_score: number;
  energy_score: number;
  impulsivity_score: number;
  sleep_hours: number;
}

interface PatientRow {
  user_id: string;
  adjustment_stage: number | null;
  expo_push_token: string | null;
}

// ── Prompt (same as single check-in, inlined for Deno compat) ────

const FAY_VOICE_PROMPT = `# Fay Voice Constraints

You are generating a message that will be displayed as spoken by "Fay", a firefly companion
in an ADHD management app. Fay is warm, brief, and observant — never a therapist, never a
parent, never a coach.

## Hard Rules

1. Maximum 15 words. If you can't say it in 15 words, rewrite shorter.
2. Maximum 2 sentences.
3. No exclamation marks except for genuine milestones (level-up, 30-day streak).
4. No emojis.
5. No guilt language: "don't forget", "you haven't", "it's been X days", "we missed you".
6. No toxic positivity: "You've got this!", "Amazing!", "Incredible!", "Keep it up!"
7. No parental tone: "I'm proud of you", "Good job", "Well done", "Don't give up".
8. No clinical advice: do not interpret symptoms, suggest coping strategies, or diagnose.
9. No comparisons to other users.
10. No time pressure: "before it's too late", "limited time", "hurry".
11. Never mention the word "streak" in a negative context (broken, lost, ended).
12. Never quantify absence ("it's been 5 days since...").

## Personality

- Warm but not performative. Like a friend who texts "proud of you" and means it.
- Brief. Phrases over sentences. Silence over filler.
- Observant. Notice patterns and reflect them. Don't prescribe.
- Present. "I'm here" energy. Not "I was waiting for you" energy.

## Tone Adaptation by Adjustment Stage

- Stage 1 (Relief): Match energy. "This is exciting — there's a framework for how your brain works."
- Stage 2 (Confusion): Gentler. "This is a lot to process. No rush."
- Stage 3 (Anger): Validate without fixing. "That frustration is real."
- Stage 4 (Sadness): Quiet. Shorter. More space. "Tough day. That's okay."
- Stage 5 (Anxiety): Practical, concrete. Show data-backed progress.
- Stage 6 (Acceptance): Peer-like. Reflective questions.

## Examples of Good Fay Messages

- "Logged. That takes more effort than people think."
- "Rough day. That's valid."
- "Seven days. You built something real this week."
- "Hey. Welcome back."
- "Done. That one had some weight to it."
- "All caught up. Go live your day."

## Output Format

Return ONLY the message text. No quotes, no attribution, no metadata.`;

// ── Flag detection (deterministic) ────────────────────────────────

const SCORE_THRESHOLD = 3;
const CONSECUTIVE_DAYS = 3;

function detectFlag(scores: DayScore[]): string | null {
  if (scores.length < CONSECUTIVE_DAYS) return null;
  const recent = scores.slice(-CONSECUTIVE_DAYS);
  const reasons: string[] = [];
  if (recent.every((s) => s.focus_score < SCORE_THRESHOLD))
    reasons.push(`Focus below ${SCORE_THRESHOLD} for ${CONSECUTIVE_DAYS}+ consecutive days`);
  if (recent.every((s) => s.mood_score < SCORE_THRESHOLD))
    reasons.push(`Mood below ${SCORE_THRESHOLD} for ${CONSECUTIVE_DAYS}+ consecutive days`);
  return reasons.length > 0 ? reasons.join("; ") : null;
}

function computeTrend(scores: DayScore[]): string {
  if (scores.length < 2) return "insufficient data";
  const half = Math.floor(scores.length / 2);
  const avg = (arr: DayScore[]) =>
    arr.reduce((s, d) => s + d.focus_score + d.mood_score, 0) / (arr.length * 2);
  const diff = avg(scores.slice(half)) - avg(scores.slice(0, half));
  if (diff > 0.5) return "improving";
  if (diff < -0.5) return "declining";
  return "stable";
}

// ── LLM call ──────────────────────────────────────────────────────

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const baseUrl = (Deno.env.get("LLM_BASE_URL") || "https://api.groq.com/openai/v1").replace(
    /\/+$/,
    ""
  );
  const model = Deno.env.get("LLM_MODEL") || "llama-3.3-70b-versatile";
  const apiKey = Deno.env.get("LLM_API_KEY");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 128,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LLM error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM returned empty response");
  return text.trim();
}

// ── Expo push notification ────────────────────────────────────────

async function sendExpoPush(token: string, message: string): Promise<void> {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: token,
        title: "Fay",
        body: message,
        sound: "default",
        channelId: "checkin",
      }),
    });
  } catch (err) {
    console.warn(`Push failed for token ${token.slice(0, 20)}...:`, err);
  }
}

// ── Auth: verify this is called by service role or cron ──────────

function verifyServiceAuth(req: Request): boolean {
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  // pg_net sends the service role key as Bearer token
  return authHeader === `Bearer ${serviceKey}`;
}

// ── Main handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  // Only allow POST
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  if (!verifyServiceAuth(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    // Find patients who do NOT have a check-in today
    // Step 1: Get all patient IDs that already have a check-in today
    const { data: alreadyCheckedIn } = await admin
      .from("ai_checkins")
      .select("patient_id")
      .gte("triggered_at", todayStart.toISOString());

    const excludeIds = (alreadyCheckedIn ?? []).map((r) => r.patient_id);

    // Step 2: Get all patients with onboarding complete
    let query = admin
      .from("patients")
      .select("user_id, adjustment_stage, expo_push_token")
      .eq("onboarding_complete", true);

    // Supabase doesn't have a clean NOT IN, so we filter client-side
    const { data: patients, error: pErr } = await query;

    if (pErr) {
      console.error("Failed to fetch patients:", pErr);
      return jsonResponse({ error: "Failed to fetch patients" }, 500);
    }

    const eligible = (patients ?? []).filter(
      (p: PatientRow) => !excludeIds.includes(p.user_id)
    );

    console.log(
      `[daily-checkin-batch] ${eligible.length} eligible patients (${excludeIds.length} already done)`
    );

    const results = { generated: 0, failed: 0, pushed: 0 };

    // Process patients sequentially to avoid LLM rate limits
    for (const patient of eligible) {
      try {
        const patientId = patient.user_id;
        const adjustmentStage = patient.adjustment_stage ?? 1;

        // Fetch 7-day scores + active module in parallel
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [logsResult, moduleResult] = await Promise.all([
          admin
            .from("symptom_logs")
            .select(
              "focus_score, mood_score, energy_score, impulsivity_score, sleep_hours, logged_at"
            )
            .eq("patient_id", patientId)
            .gte("logged_at", sevenDaysAgo.toISOString())
            .order("logged_at", { ascending: true }),
          admin
            .from("patient_modules")
            .select("module_id")
            .eq("patient_id", patientId)
            .eq("status", "active")
            .limit(1)
            .maybeSingle(),
        ]);

        const recentScores: DayScore[] = (logsResult.data ?? []).map((log) => ({
          date: (log.logged_at as string).split("T")[0] ?? log.logged_at,
          focus_score: log.focus_score,
          mood_score: log.mood_score,
          energy_score: log.energy_score,
          impulsivity_score: log.impulsivity_score,
          sleep_hours: log.sleep_hours,
        }));

        // Resolve module title
        let activeModuleTitle = "";
        if (moduleResult.data?.module_id) {
          const { data: mod } = await admin
            .from("yb_modules")
            .select("title")
            .eq("id", moduleResult.data.module_id)
            .single();
          activeModuleTitle = mod?.title ?? "";
        }

        // Build prompt context
        const avgFocus =
          recentScores.length > 0
            ? (recentScores.reduce((s, d) => s + d.focus_score, 0) / recentScores.length).toFixed(1)
            : "N/A";
        const avgMood =
          recentScores.length > 0
            ? (recentScores.reduce((s, d) => s + d.mood_score, 0) / recentScores.length).toFixed(1)
            : "N/A";

        const contextSummary = [
          `Adjustment stage: ${adjustmentStage}`,
          `Active module: ${activeModuleTitle || "None"}`,
          `7-day avg focus: ${avgFocus}, avg mood: ${avgMood}`,
          `Trend: ${computeTrend(recentScores)}`,
          `Days of data: ${recentScores.length}`,
        ].join("\n");

        const systemPrompt = `${FAY_VOICE_PROMPT}\n\n---\n\nPatient context:\n${contextSummary}`;

        // Generate
        const raw = await callLLM(
          systemPrompt,
          "Generate a single Fay check-in message for this patient. Follow all voice rules strictly."
        );

        // Hard-cap at 20 words
        const words = raw.split(/\s+/);
        const message = words.length > 20 ? words.slice(0, 20).join(" ") + "..." : raw;

        // Flag detection
        const flagReason = detectFlag(recentScores);

        // Store
        const { error: insertError } = await admin.from("ai_checkins").insert({
          patient_id: patientId,
          triggered_at: new Date().toISOString(),
          context: {
            patient_id: patientId,
            adjustment_stage: adjustmentStage,
            active_module_title: activeModuleTitle,
            avg_focus: avgFocus,
            avg_mood: avgMood,
            trend: computeTrend(recentScores),
            days_of_data: recentScores.length,
            trigger: "cron",
          },
          response: message,
          flagged_for_provider: flagReason !== null,
          flag_reason: flagReason,
        });

        if (insertError) {
          console.error(`Insert failed for ${patientId}:`, insertError);
          results.failed++;
          continue;
        }

        results.generated++;

        // Send push notification if token exists
        if (patient.expo_push_token) {
          await sendExpoPush(patient.expo_push_token, message);
          results.pushed++;
        }
      } catch (err) {
        console.error(`Failed for patient ${patient.user_id}:`, err);
        results.failed++;
      }
    }

    console.log(`[daily-checkin-batch] Done:`, results);
    return jsonResponse({ data: results }, 200);
  } catch (err) {
    console.error("[daily-checkin-batch] Fatal error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
