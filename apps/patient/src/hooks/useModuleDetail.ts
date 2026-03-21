import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface ModuleInfo {
  id: number;
  chapter_number: number;
  title: string;
  description: string;
}

export interface ContentItem {
  id: string;
  module_id: number;
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

async function fetchModuleDetail(moduleId: number, userId: string | undefined) {
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
  if (userId && items && items.length > 0) {
    const itemIds = items.map((i: ContentItem) => i.id);
    const { data: responses, error: respError } = await supabase
      .from('patient_content_responses')
      .select('*')
      .eq('patient_id', userId)
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
  const numericId = moduleId ? Number(moduleId) : 0;

  return useQuery({
    queryKey: ['module-detail', numericId, user?.id],
    queryFn: () => fetchModuleDetail(numericId, user?.id),
    enabled: !!moduleId && numericId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
