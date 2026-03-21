import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

// ── GET — List all YB modules ────────────────────────────────────

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    // Auth check
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

    const { data: modules, error } = await supabase
      .from('yb_modules')
      .select('id, chapter_number, title')
      .eq('active', true)
      .order('sequence_order', { ascending: true });

    if (error) {
      console.error('[GET /api/modules]', error);
      return NextResponse.json(
        { data: null, error: 'Failed to fetch modules' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: modules, error: null });
  } catch (err) {
    console.error('[GET /api/modules]', err);
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
