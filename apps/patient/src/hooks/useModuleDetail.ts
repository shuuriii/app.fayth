import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';

export interface ModuleInfo {
  id: string;
  chapter_number: number;
  title: string;
  description: string;
}

export interface ContentItem {
  id: string;
  module_id: string;
  type: 'worksheet' | 'psychoeducation' | 'exercise' | 'diary' | 'table';
  title: string;
  instructions: string | null;
  schema: any;
  xp_value: number;
  companion_website_ref: string | null;
}

export interface ContentResponse {
  id: string;
  patient_id: string;
  content_item_id: string;
  session_date: string;
  response_data: Record<string, any>;
  ai_feedback: string | null;
  flagged: boolean;
}

async function fetchModuleDetail(moduleId: string, patientId: string | undefined) {
  // Fetch module info
  const { data: moduleData, error: modError } = await supabase
    .from('yb_modules')
    .select('id, chapter_number, title, description')
    .eq('id', moduleId)
    .single();

  if (modError) throw modError;

  // Fetch content items
  const { data: items, error: itemsError } = await supabase
    .from('yb_content_items')
    .select('*')
    .eq('module_id', moduleId)
    .order('id', { ascending: true });

  if (itemsError) throw itemsError;

  // Fetch existing responses
  const responseMap = new Map<string, ContentResponse>();
  if (patientId && items && items.length > 0) {
    const itemIds = items.map((i: ContentItem) => i.id);
    const { data: responses, error: respError } = await supabase
      .from('patient_content_responses')
      .select('*')
      .eq('patient_id', patientId)
      .in('content_item_id', itemIds)
      .order('session_date', { ascending: false });

    if (!respError && responses) {
      for (const row of responses) {
        if (!responseMap.has(row.content_item_id)) {
          responseMap.set(row.content_item_id, row);
        }
      }
    }
  }

  return {
    module: moduleData as ModuleInfo,
    items: (items ?? []) as ContentItem[],
    responses: responseMap,
  };
}

export function useModuleDetail(moduleId: string | undefined) {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);

  return useQuery({
    queryKey: ['module-detail', moduleId, patientId],
    queryFn: () => fetchModuleDetail(moduleId!, patientId ?? undefined),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}
