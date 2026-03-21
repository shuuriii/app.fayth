import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';
import type { ContentItem, ContentResponse } from '@/hooks/useModuleDetail';

async function fetchWorksheetData(itemId: string, userId: string | undefined) {
  // Fetch content item
  const { data: item, error: itemError } = await supabase
    .from('yb_content_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (itemError) throw itemError;

  // Fetch existing response
  let existingResponse: ContentResponse | null = null;
  if (userId) {
    const { data, error } = await supabase
      .from('patient_content_responses')
      .select('*')
      .eq('patient_id', userId)
      .eq('content_item_id', itemId)
      .order('session_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      existingResponse = data;
    }
  }

  return {
    item: item as ContentItem,
    existingResponse,
  };
}

export function useWorksheet(itemId: string | undefined) {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);

  return useQuery({
    queryKey: ['worksheet', itemId, patientId],
    queryFn: () => fetchWorksheetData(itemId!, patientId!),
    enabled: !!itemId && !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitWorksheet() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentItemId,
      responseData,
      xpValue,
    }: {
      contentItemId: string;
      responseData: Record<string, any>;
      xpValue: number;
    }) => {
      if (!patientId) throw new Error('Not authenticated');

      // Insert response
      const { error: insertError } = await supabase
        .from('patient_content_responses')
        .insert({
          patient_id: patientId,
          content_item_id: contentItemId,
          session_date: new Date().toISOString().split('T')[0],
          response_data: responseData,
          flagged: false,
        });

      if (insertError) throw insertError;

      // Award XP atomically via Postgres RPC (prevents race condition)
      if (xpValue > 0) {
        const { error: xpError } = await supabase.rpc('increment_xp', {
          p_user_id: user!.id,
          p_amount: xpValue,
        });

        if (xpError) {
          console.warn('[useSubmitWorksheet] XP increment failed:', xpError.message);
        }
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['worksheet', variables.contentItemId] });
      queryClient.invalidateQueries({ queryKey: ['module-detail'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
      queryClient.invalidateQueries({ queryKey: ['active-module'] });
    },
  });
}

export function useMarkPsychoeducationRead() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentItemId: string) => {
      if (!patientId) throw new Error('Not authenticated');

      // Check if already marked
      const { data: existing } = await supabase
        .from('patient_content_responses')
        .select('id')
        .eq('patient_id', patientId)
        .eq('content_item_id', contentItemId)
        .limit(1)
        .maybeSingle();

      if (existing) return; // Already read

      await supabase
        .from('patient_content_responses')
        .insert({
          patient_id: patientId,
          content_item_id: contentItemId,
          session_date: new Date().toISOString().split('T')[0],
          response_data: { read: true },
          flagged: false,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-detail'] });
    },
  });
}
