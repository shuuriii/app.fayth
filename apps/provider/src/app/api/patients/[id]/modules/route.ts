import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { schemas, uuidSchema } from '@/lib/validation';

// ── POST — Assign a module to a patient ──────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: patientId } = await params;

  // Validate path parameter
  const pathResult = uuidSchema.safeParse(patientId);
  if (!pathResult.success) {
    return NextResponse.json(
      { data: null, error: 'Invalid patient ID format' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schemas.assignModule.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
        { status: 400 }
      );
    }

    const moduleId = parsed.data.module_id;

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
        { data: null, error: 'Forbidden — only the assigned psychologist or admin can assign modules' },
        { status: 403 }
      );
    }

    if (!patientResult.data) {
      return NextResponse.json(
        { data: null, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Verify the module exists
    const { data: mod } = await admin
      .from('yb_modules')
      .select('id, title, chapter_number')
      .eq('id', moduleId)
      .single();

    if (!mod) {
      return NextResponse.json(
        { data: null, error: 'Module not found' },
        { status: 404 }
      );
    }

    // Check if already completed — don't re-assign
    const { data: existing } = await admin
      .from('patient_modules')
      .select('status')
      .eq('patient_id', patientId)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (existing?.status === 'complete') {
      return NextResponse.json(
        { data: null, error: 'Module is already completed — cannot re-assign' },
        { status: 409 }
      );
    }

    // Upsert: assign (or re-assign if currently locked/assigned/active)
    const { data: result, error: upsertError } = await admin
      .from('patient_modules')
      .upsert(
        {
          patient_id: patientId,
          module_id: moduleId,
          status: 'assigned',
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: 'patient_id,module_id' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('[POST /api/patients/[id]/modules]', upsertError);
      return NextResponse.json(
        { data: null, error: 'Failed to assign module' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          patient_id: patientId,
          module_id: moduleId,
          module_title: mod.title,
          chapter_number: mod.chapter_number,
          status: 'assigned',
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/patients/[id]/modules]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
