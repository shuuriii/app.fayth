import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import {
  generatePreSessionSummary,
  type PreSessionContext,
} from '@fayth/ai';
import type { AdjustmentStage } from '@fayth/types';

// ── GET — Retrieve existing summary ────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  try {
    const supabase = await createSupabaseServer();

    // Auth: get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, patient_id, provider_id, ai_pre_session_summary')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { data: null, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Auth: check user is the session's provider or an admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (
      profile?.role !== 'admin' &&
      session.provider_id !== user.id
    ) {
      return NextResponse.json(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!session.ai_pre_session_summary) {
      return NextResponse.json(
        { data: null, error: 'No summary generated yet' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { summary: session.ai_pre_session_summary },
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/sessions/[id]/summary]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── POST — Generate pre-session summary ────────────────────────────

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;

  try {
    const supabase = await createSupabaseServer();

    // Auth: get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch session via RLS-scoped client first for auth check
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, patient_id, provider_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { data: null, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Auth: check user is the session's provider or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (
      profile?.role !== 'admin' &&
      session.provider_id !== user.id
    ) {
      return NextResponse.json(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Use admin client for cross-table data aggregation
    const admin = createSupabaseAdmin();
    const patientId = session.patient_id;
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const cutoff = fourteenDaysAgo.toISOString();

    // Parallel fetches for context assembly
    const [
      patientResult,
      symptomLogsResult,
      patientModulesResult,
      contentResponsesResult,
      medicationsResult,
      medicationLogsResult,
      flaggedResponsesResult,
      flaggedCheckinsResult,
    ] = await Promise.all([
      // Patient record
      admin
        .from('patients')
        .select('adhd_subtype, adjustment_stage')
        .eq('user_id', patientId)
        .single(),

      // Symptom logs — last 14 days
      admin
        .from('symptom_logs')
        .select(
          'focus_score, mood_score, energy_score, impulsivity_score, sleep_hours, logged_at'
        )
        .eq('patient_id', patientId)
        .gte('logged_at', cutoff)
        .order('logged_at', { ascending: true }),

      // Active/assigned modules with titles
      admin
        .from('patient_modules')
        .select('module_id, status, xp_earned')
        .eq('patient_id', patientId)
        .in('status', ['active', 'assigned']),

      // Content responses — last 14 days
      admin
        .from('patient_content_responses')
        .select('content_item_id, session_date')
        .eq('patient_id', patientId)
        .gte('session_date', cutoff.split('T')[0]),

      // Active medications
      admin
        .from('medications')
        .select('id')
        .eq('patient_id', patientId)
        .eq('active', true),

      // Medication logs — last 14 days
      admin
        .from('medication_logs')
        .select('taken_at, missed')
        .eq('patient_id', patientId)
        .gte('taken_at', cutoff),

      // Flagged content responses
      admin
        .from('patient_content_responses')
        .select('content_item_id')
        .eq('patient_id', patientId)
        .eq('flagged', true)
        .gte('session_date', cutoff.split('T')[0]),

      // Flagged AI check-ins
      admin
        .from('ai_checkins')
        .select('flag_reason')
        .eq('patient_id', patientId)
        .eq('flagged_for_provider', true)
        .gte('triggered_at', cutoff),
    ]);

    if (patientResult.error || !patientResult.data) {
      return NextResponse.json(
        { data: null, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const patient = patientResult.data;

    // Resolve module titles
    const moduleIds = (patientModulesResult.data ?? []).map(
      (m) => m.module_id
    );
    let activeModuleTitles: string[] = [];

    if (moduleIds.length > 0) {
      const { data: modules } = await admin
        .from('yb_modules')
        .select('id, title')
        .in('id', moduleIds);

      activeModuleTitles = (modules ?? []).map((m) => m.title);
    }

    // Resolve content item titles for worksheet completions
    const contentItemIds = (contentResponsesResult.data ?? []).map(
      (r) => r.content_item_id
    );
    let worksheetCompletions: PreSessionContext['worksheet_completions'] = [];

    if (contentItemIds.length > 0) {
      const { data: items } = await admin
        .from('yb_content_items')
        .select('id, title, xp_value')
        .in('id', contentItemIds);

      const itemMap = new Map(
        (items ?? []).map((i) => [i.id, { title: i.title, xp: i.xp_value ?? 0 }])
      );

      worksheetCompletions = (contentResponsesResult.data ?? []).map((r) => {
        const item = itemMap.get(r.content_item_id);
        return {
          title: item?.title ?? `Content #${r.content_item_id}`,
          completed_at: r.session_date,
          xp_earned: item?.xp ?? 0,
        };
      });
    }

    // Calculate medication adherence rate
    const totalMedLogs = medicationLogsResult.data?.length ?? 0;
    const missedCount =
      medicationLogsResult.data?.filter((l) => l.missed).length ?? 0;
    const adherenceRate =
      totalMedLogs > 0
        ? Math.round(((totalMedLogs - missedCount) / totalMedLogs) * 100)
        : 100; // No medications or no logs = 100% by default

    // Assemble flags
    const flags: string[] = [];
    (flaggedResponsesResult.data ?? []).forEach((r) => {
      flags.push(`Flagged worksheet response: content item #${r.content_item_id}`);
    });
    (flaggedCheckinsResult.data ?? []).forEach((c) => {
      if (c.flag_reason) {
        flags.push(c.flag_reason);
      }
    });

    // Build the context for the AI generator
    const context: PreSessionContext = {
      patient_id: patientId,
      adhd_subtype: patient.adhd_subtype,
      adjustment_stage: patient.adjustment_stage as AdjustmentStage,
      active_modules: activeModuleTitles,
      symptom_logs: (symptomLogsResult.data ?? []).map((log) => ({
        focus_score: log.focus_score,
        mood_score: log.mood_score,
        energy_score: log.energy_score,
        impulsivity_score: log.impulsivity_score,
        sleep_hours: log.sleep_hours,
        logged_at: log.logged_at,
      })),
      worksheet_completions: worksheetCompletions,
      medication_adherence_rate: adherenceRate,
      flags,
    };

    // Generate the summary
    const summary = await generatePreSessionSummary(context);

    // Store result in the session record
    const { error: updateError } = await admin
      .from('sessions')
      .update({ ai_pre_session_summary: summary })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[POST /api/sessions/[id]/summary] Failed to store summary:', updateError);
      // Still return the generated summary even if storage fails
    }

    return NextResponse.json(
      { data: { summary }, error: null },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/sessions/[id]/summary]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
