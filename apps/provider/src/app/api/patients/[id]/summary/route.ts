import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';

// ── GET — Latest AI pre-session summary for a patient ──────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

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

    // Auth: verify the user is an assigned provider or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (!isAdmin) {
      const adminClient = createSupabaseAdmin();
      const { data: patient } = await adminClient
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

    // Find the most recent session for this patient that has a summary
    const adminClient = createSupabaseAdmin();
    const { data: session, error: sessionError } = await adminClient
      .from('sessions')
      .select('id, scheduled_at, ai_pre_session_summary')
      .eq('patient_id', patientId)
      .not('ai_pre_session_summary', 'is', null)
      .order('scheduled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      console.error('[GET /api/patients/[id]/summary]', sessionError);
      return NextResponse.json(
        { data: null, error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!session || !session.ai_pre_session_summary) {
      return NextResponse.json(
        { data: null, error: 'No summary available for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        session_id: session.id,
        scheduled_at: session.scheduled_at,
        summary: session.ai_pre_session_summary,
      },
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/patients/[id]/summary]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
