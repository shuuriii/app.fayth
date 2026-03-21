import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { calculateXP } from '@fayth/yb-engine';
import type { XPAction } from '@fayth/yb-engine';

export type { XPAction };

/**
 * Shared hook for awarding XP.
 *
 * Calls the increment_xp RPC (which atomically updates total_xp AND level),
 * then invalidates the patient cache so the UI reflects the new values.
 */
export function useAwardXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      streakDays,
      overrideAmount,
    }: {
      action: XPAction;
      streakDays?: number;
      /** Use this to pass a content item's xp_value directly instead of the default */
      overrideAmount?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const amount = overrideAmount ?? calculateXP(action, streakDays);
      if (amount <= 0) return 0;

      const { data, error } = await supabase.rpc('increment_xp', {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (error) {
        console.warn(`[useAwardXP] XP increment failed for ${action}:`, error.message);
        // Don't throw — XP failure shouldn't block the primary action
        return 0;
      }

      return (data as number) ?? 0;
    },
    onSuccess: () => {
      // Refresh patient data so XP bar, level badge, etc. update
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
  });
}
