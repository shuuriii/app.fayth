import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import {
  generateDailyCheckin,
  type CheckinContext,
  type DayScore,
} from '@fayth/ai';
import type { AdjustmentStage } from '@fayth/types';
import { schemas } from '@/lib/validation';

// ── POST — Trigger daily check-in for a patient ───────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schemas.triggerCheckin.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    const patientId = parsed.data.patient_id;

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

    // Auth: check user is the patient themselves, their assigned provider, or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isPatientSelf = user.id === patientId;

    if (!isAdmin && !isPatientSelf) {
      // Check if user is an assigned provider for this patient
      const admin = createSupabaseAdmin();
      const { data: patient } = await admin
        .from('patients')
        .select('assigned_psychologist_id, assigned_psychiatrist_id')
        .eq('user_id', patientId)
        .single();

      if (
        !patient ||
        (patient.assigned_psychologist_id !== user.id &&
          patient.assigned_psychiatrist_id !== user.id)
      ) {
        return NextResponse.json(
          { data: null, error: 'Forbidden' },
          { status: 403 }
        );
      }
    }

    // Use admin client for cross-table data aggregation
    const adminClient = createSupabaseAdmin();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString();

    // Parallel fetches
    const [patientResult, symptomLogsResult, activeModuleResult] =
      await Promise.all([
        // Patient record
        adminClient
          .from('patients')
          .select('adjustment_stage')
          .eq('user_id', patientId)
          .single(),

        // Symptom logs — last 7 days
        adminClient
          .from('symptom_logs')
          .select(
            'focus_score, mood_score, energy_score, impulsivity_score, sleep_hours, logged_at'
          )
          .eq('patient_id', patientId)
          .gte('logged_at', cutoff)
          .order('logged_at', { ascending: true }),

        // Active module (pick the first active one)
        adminClient
          .from('patient_modules')
          .select('module_id')
          .eq('patient_id', patientId)
          .eq('status', 'active')
          .limit(1)
          .maybeSingle(),
      ]);

    if (patientResult.error || !patientResult.data) {
      return NextResponse.json(
        { data: null, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Resolve active module title
    let activeModuleTitle = '';
    if (activeModuleResult.data?.module_id) {
      const { data: mod } = await adminClient
        .from('yb_modules')
        .select('title')
        .eq('id', activeModuleResult.data.module_id)
        .single();

      activeModuleTitle = mod?.title ?? '';
    }

    // Build recent scores array
    const recentScores: DayScore[] = (symptomLogsResult.data ?? []).map(
      (log) => ({
        date: log.logged_at.split('T')[0] ?? log.logged_at,
        focus_score: log.focus_score,
        mood_score: log.mood_score,
        energy_score: log.energy_score,
        impulsivity_score: log.impulsivity_score,
        sleep_hours: log.sleep_hours,
      })
    );

    // Build the context for the AI generator
    const context: CheckinContext = {
      patient_id: patientId,
      recent_scores: recentScores,
      active_module_title: activeModuleTitle,
      adjustment_stage: patientResult.data
        .adjustment_stage as AdjustmentStage,
    };

    // Generate the check-in
    const result = await generateDailyCheckin(context);

    // Store in ai_checkins table
    const { error: insertError } = await adminClient
      .from('ai_checkins')
      .insert({
        patient_id: patientId,
        triggered_at: new Date().toISOString(),
        context: context as unknown as Record<string, unknown>,
        response: result.message,
        flagged_for_provider: result.flagForProvider,
        flag_reason: result.flagReason ?? null,
      });

    if (insertError) {
      console.error('[POST /api/checkins] Failed to store check-in:', insertError);
      // Still return the generated check-in even if storage fails
    }

    return NextResponse.json(
      {
        data: {
          message: result.message,
          flagged_for_provider: result.flagForProvider,
          flag_reason: result.flagReason ?? null,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/checkins]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
