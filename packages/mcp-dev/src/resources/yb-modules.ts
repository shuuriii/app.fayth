import { getSupabaseClient } from '../lib/supabase.js';

/**
 * Resource: fayth://yb-modules
 * Returns all 14 YB Programme module definitions.
 */
export async function getYBModules(): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('yb_modules')
      .select('id, chapter_number, title, description, prerequisite_chapters, target_symptoms, estimated_sessions, sequence_order, active')
      .order('sequence_order', { ascending: true });

    if (error) {
      return JSON.stringify({ error: error.message }, null, 2);
    }

    return JSON.stringify(data, null, 2);
  } catch (err) {
    // Fallback: return static module list from seed knowledge
    return JSON.stringify(STATIC_MODULES, null, 2);
  }
}

// Fallback when Supabase is not connected
const STATIC_MODULES = [
  { chapter_number: 1, title: 'Introduction to ADHD in Adults', prerequisite_chapters: [] },
  { chapter_number: 2, title: 'Assessment', prerequisite_chapters: [1] },
  { chapter_number: 3, title: 'Treatment Overview & Medication', prerequisite_chapters: [2] },
  { chapter_number: 4, title: 'Inattention & Memory', prerequisite_chapters: [3] },
  { chapter_number: 5, title: 'Time Management', prerequisite_chapters: [4] },
  { chapter_number: 6, title: 'Problem Solving', prerequisite_chapters: [4] },
  { chapter_number: 7, title: 'Impulsivity', prerequisite_chapters: [4] },
  { chapter_number: 8, title: 'Social Relationships', prerequisite_chapters: [] },
  { chapter_number: 9, title: 'Anxiety', prerequisite_chapters: [] },
  { chapter_number: 10, title: 'Frustration & Anger', prerequisite_chapters: [] },
  { chapter_number: 11, title: 'Low Mood & Depression', prerequisite_chapters: [] },
  { chapter_number: 12, title: 'Sleep Problems', prerequisite_chapters: [] },
  { chapter_number: 13, title: 'Substance Misuse', prerequisite_chapters: [] },
  { chapter_number: 14, title: 'Preparing for the Future', prerequisite_chapters: [] },
];
