import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { schemas } from '@/lib/validation';

// ── GET — Retrieve session detail ────────────────────────────────

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
      .select(
        'id, patient_id, provider_id, type, scheduled_at, duration_mins, status, provider_notes, ai_pre_session_summary, modules_worked_on'
      )
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

    // Fetch patient name
    const { data: patientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', session.patient_id)
      .single();

    return NextResponse.json({
      data: {
        session,
        patient_name: patientProfile?.full_name ?? null,
      },
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/sessions/[id]]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── PATCH — Update session (notes, status) ───────────────────────

export async function PATCH(
  request: NextRequest,
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

    // Fetch session for auth check
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, provider_id')
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

    // Parse and validate body
    const body = await request.json();
    const parsed = schemas.updateSession.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.provider_notes !== undefined) {
      updates.provider_notes = parsed.data.provider_notes;
    }
    if (parsed.data.status !== undefined) {
      updates.status = parsed.data.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { data: null, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Use admin client to update
    const admin = createSupabaseAdmin();
    const { data: updated, error: updateError } = await admin
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select(
        'id, patient_id, provider_id, type, scheduled_at, duration_mins, status, provider_notes, ai_pre_session_summary, modules_worked_on'
      )
      .single();

    if (updateError) {
      console.error('[PATCH /api/sessions/[id]]', updateError);
      return NextResponse.json(
        { data: null, error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { session: updated },
      error: null,
    });
  } catch (err) {
    console.error('[PATCH /api/sessions/[id]]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
