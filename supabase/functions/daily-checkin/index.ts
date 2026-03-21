// supabase/functions/daily-checkin — Generates a Fay-voiced AI check-in after symptom log submission
// Triggered by the patient app. Auth via Supabase JWT.

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

interface CheckinResult {
  message: string;
  flagged_for_provider: boolean;
  flag_reason: string | null;
}

// ── Prompt templates (inlined for Deno compat) ─────────────────────

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

// ── Flag detection (deterministic, no LLM) ─────────────────────────

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

// ── Trend computation ──────────────────────────────────────────────

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

// ── LLM call (OpenAI-compatible) ───────────────────────────────────

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

// ── CORS ──────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || "").split(",").filter(Boolean);

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  // In development (Expo), origin may be empty — allow Supabase client calls
  if (!origin) return "";
  if (ALLOWED_ORIGINS.length === 0) return origin; // No allowlist configured = allow all (dev)
  return ALLOWED_ORIGINS.includes(origin) ? origin : "";
}

// ── Main handler ───────────────────────────────────────────────────

Deno.serve(async (req) => {
  const corsOrigin = getCorsOrigin(req);

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Auth — create client with the user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401, corsOrigin);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401, corsOrigin);
    }

    const patientId = user.id;

    // Admin client for cross-table reads + writes
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // ── Rate limit: max 1 check-in per patient per day ──
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await admin
      .from("ai_checkins")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .gte("triggered_at", todayStart.toISOString());

    if ((count ?? 0) > 0) {
      // Already generated today — return the existing one
      const { data: existing } = await admin
        .from("ai_checkins")
        .select("response, flagged_for_provider, flag_reason")
        .eq("patient_id", patientId)
        .gte("triggered_at", todayStart.toISOString())
        .order("triggered_at", { ascending: false })
        .limit(1)
        .single();

      return jsonResponse({
        data: {
          message: existing?.response ?? "",
          flagged_for_provider: existing?.flagged_for_provider ?? false,
          flag_reason: existing?.flag_reason ?? null,
          cached: true,
        },
      }, 200, corsOrigin);
    }

    // ── Fetch context in parallel ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [patientResult, logsResult, moduleResult] = await Promise.all([
      admin
        .from("patients")
        .select("adjustment_stage")
        .eq("user_id", patientId)
        .single(),
      admin
        .from("symptom_logs")
        .select("focus_score, mood_score, energy_score, impulsivity_score, sleep_hours, logged_at")
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

    if (patientResult.error || !patientResult.data) {
      return jsonResponse({ error: "Patient not found" }, 404, corsOrigin);
    }

    const adjustmentStage: number = patientResult.data.adjustment_stage ?? 1;

    // Resolve active module title
    let activeModuleTitle = "";
    if (moduleResult.data?.module_id) {
      const { data: mod } = await admin
        .from("yb_modules")
        .select("title")
        .eq("id", moduleResult.data.module_id)
        .single();
      activeModuleTitle = mod?.title ?? "";
    }

    // Build scores
    const recentScores: DayScore[] = (logsResult.data ?? []).map((log) => ({
      date: (log.logged_at as string).split("T")[0] ?? log.logged_at,
      focus_score: log.focus_score,
      mood_score: log.mood_score,
      energy_score: log.energy_score,
      impulsivity_score: log.impulsivity_score,
      sleep_hours: log.sleep_hours,
    }));

    // ── Build LLM prompt ──
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

    // ── Generate ──
    const raw = await callLLM(
      systemPrompt,
      "Generate a single Fay check-in message for this patient. Follow all voice rules strictly."
    );

    // Hard-cap at 20 words
    const words = raw.split(/\s+/);
    const message = words.length > 20 ? words.slice(0, 20).join(" ") + "..." : raw;

    // ── Flag detection ──
    const flagReason = detectFlag(recentScores);

    // ── Store ──
    const checkinContext = {
      patient_id: patientId,
      adjustment_stage: adjustmentStage,
      active_module_title: activeModuleTitle,
      avg_focus: avgFocus,
      avg_mood: avgMood,
      trend: computeTrend(recentScores),
      days_of_data: recentScores.length,
    };

    const { error: insertError } = await admin.from("ai_checkins").insert({
      patient_id: patientId,
      triggered_at: new Date().toISOString(),
      context: checkinContext,
      response: message,
      flagged_for_provider: flagReason !== null,
      flag_reason: flagReason,
    });

    if (insertError) {
      console.error("Failed to store check-in:", insertError);
      // Still return the message
    }

    return jsonResponse({
      data: {
        message,
        flagged_for_provider: flagReason !== null,
        flag_reason: flagReason,
        cached: false,
      },
    }, 200, corsOrigin);
  } catch (err) {
    console.error("daily-checkin error:", err);
    return jsonResponse({ error: "Internal server error" }, 500, corsOrigin);
  }
});

// ── Helpers ────────────────────────────────────────────────────────

function jsonResponse(body: Record<string, unknown>, status = 200, corsOrigin = "") {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (corsOrigin) {
    headers["Access-Control-Allow-Origin"] = corsOrigin;
  }
  return new Response(JSON.stringify(body), { status, headers });
}
