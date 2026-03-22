import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { schemas, uuidSchema } from '@/lib/validation';

// ── GET — Fetch a single patient content response with its content item ──

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const { id: patientId, responseId } = await params;

  // Validate path parameters
  const patientIdResult = uuidSchema.safeParse(patientId);
  const responseIdResult = uuidSchema.safeParse(responseId);

  if (!patientIdResult.success || !responseIdResult.success) {
    return NextResponse.json(
      { data: null, error: 'Invalid ID format' },
      { status: 400 }
    );
  }

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

    // Auth: must be admin or assigned psychologist
    const admin = createSupabaseAdmin();

    const [profileResult, patientResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single(),
      admin
        .from('patients')
        .select('assigned_psychologist_id')
        .eq('user_id', patientId)
        .single(),
    ]);

    const isAdmin = profileResult.data?.role === 'admin';
    const isAssignedPsychologist =
      patientResult.data?.assigned_psychologist_id === user.id;

    if (!isAdmin && !isAssignedPsychologist) {
      return NextResponse.json(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!patientResult.data) {
      return NextResponse.json(
        { data: null, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Fetch the response
    const { data: response, error: responseError } = await admin
      .from('patient_content_responses')
      .select('id, patient_id, content_item_id, session_date, response_data, ai_feedback, reviewed_by_provider_id, flagged')
      .eq('id', responseId)
      .eq('patient_id', patientId)
      .single();

    if (responseError || !response) {
      return NextResponse.json(
        { data: null, error: 'Response not found' },
        { status: 404 }
      );
    }

    // Fetch the content item
    const { data: contentItem } = await admin
      .from('yb_content_items')
      .select('id, module_id, type, title, instructions, schema, xp_value')
      .eq('id', response.content_item_id)
      .single();

    return NextResponse.json({
      data: { response, content_item: contentItem },
      error: null,
    });
  } catch (err) {
    console.error('[GET /api/patients/[id]/responses/[responseId]]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ── PATCH — Provider reviews a response (feedback + flag) ────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  const { id: patientId, responseId } = await params;

  // Validate path parameters
  const patientIdResult = uuidSchema.safeParse(patientId);
  const responseIdResult = uuidSchema.safeParse(responseId);

  if (!patientIdResult.success || !responseIdResult.success) {
    return NextResponse.json(
      { data: null, error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schemas.reviewResponse.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

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

    // Auth: must be admin or assigned psychologist
    const admin = createSupabaseAdmin();

    const [profileResult, patientResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single(),
      admin
        .from('patients')
        .select('assigned_psychologist_id')
        .eq('user_id', patientId)
        .single(),
    ]);

    const isAdmin = profileResult.data?.role === 'admin';
    const isAssignedPsychologist =
      patientResult.data?.assigned_psychologist_id === user.id;

    if (!isAdmin && !isAssignedPsychologist) {
      return NextResponse.json(
        { data: null, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!patientResult.data) {
      return NextResponse.json(
        { data: null, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      reviewed_by_provider_id: user.id,
    };

    if (parsed.data.provider_feedback !== undefined) {
      updatePayload.ai_feedback = parsed.data.provider_feedback;
    }

    if (parsed.data.flagged !== undefined) {
      updatePayload.flagged = parsed.data.flagged;
    }

    const { data: updated, error: updateError } = await admin
      .from('patient_content_responses')
      .update(updatePayload)
      .eq('id', responseId)
      .eq('patient_id', patientId)
      .select()
      .single();

    if (updateError || !updated) {
      console.error('[PATCH /api/patients/[id]/responses/[responseId]]', updateError);
      return NextResponse.json(
        { data: null, error: 'Failed to update response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error('[PATCH /api/patients/[id]/responses/[responseId]]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
