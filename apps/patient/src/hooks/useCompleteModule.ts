import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';
import { useAwardXP } from '@/hooks/useAwardXP';

/**
 * Marks a module as complete and awards the 500 XP completion bonus.
 *
 * Precondition: all required content items in the module should be completed
 * before calling this. The caller is responsible for that check.
 */
export function useCompleteModule() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const queryClient = useQueryClient();
  const awardXP = useAwardXP();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!patientId) throw new Error('Not authenticated');

      // Update patient_modules status to complete
      const { data, error } = await supabase
        .from('patient_modules')
        .update({
          status: 'complete',
          completed_at: new Date().toISOString(),
        })
        .eq('patient_id', patientId)
        .eq('module_id', moduleId)
        .in('status', ['active', 'assigned']) // Only complete if not already complete
        .select()
        .single();

      if (error) throw error;

      // Sum up XP from all content items completed in this module
      const { data: items } = await supabase
        .from('yb_content_items')
        .select('id, xp_value')
        .eq('module_id', moduleId);

      const totalItemXP = (items ?? []).reduce(
        (sum, item) => sum + (item.xp_value ?? 0),
        0,
      );

      // Store total XP earned on the patient_modules row (for provider dashboard)
      if (totalItemXP > 0) {
        await supabase
          .from('patient_modules')
          .update({ xp_earned: totalItemXP })
          .eq('patient_id', patientId)
          .eq('module_id', moduleId);
      }

      // Award the 500 XP module completion bonus — awaited so patient cache sees it
      await awardXP.mutateAsync({ action: 'complete_module' }).catch(() => {});

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-detail'] });
      queryClient.invalidateQueries({ queryKey: ['active-module'] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
  });
}
