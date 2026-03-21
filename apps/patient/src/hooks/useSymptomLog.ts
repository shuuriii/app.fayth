import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { SymptomLogInput } from '@fayth/types';

interface SymptomLog extends SymptomLogInput {
  id: string;
  patient_id: string;
  logged_at: string;
}

async function fetchLogs(userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const sevenDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7,
  ).toISOString();

  const [todayResult, recentResult] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('patient_id', userId)
      .gte('logged_at', todayStart)
      .order('logged_at', { ascending: false })
      .limit(1),
    supabase
      .from('symptom_logs')
      .select('*')
      .eq('patient_id', userId)
      .gte('logged_at', sevenDaysAgo)
      .order('logged_at', { ascending: false }),
  ]);

  if (todayResult.error) throw todayResult.error;
  if (recentResult.error) throw recentResult.error;

  return {
    todayLog: todayResult.data?.[0] as SymptomLog | undefined ?? null,
    recentLogs: (recentResult.data ?? []) as SymptomLog[],
  };
}

export function useSymptomLog(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['symptom-logs', userId],
    queryFn: () => fetchLogs(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const submitMutation = useMutation({
    mutationFn: async (input: SymptomLogInput) => {
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptom_logs')
        .insert({
          patient_id: userId,
          focus_score: input.focus_score,
          mood_score: input.mood_score,
          energy_score: input.energy_score,
          impulsivity_score: input.impulsivity_score,
          sleep_hours: input.sleep_hours,
          notes: input.notes ?? null,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptom-logs', userId] });
    },
  });

  return {
    todayLog: query.data?.todayLog ?? null,
    recentLogs: query.data?.recentLogs ?? [],
    loading: query.isLoading,
    submitting: submitMutation.isPending,
    error: query.error?.message ?? submitMutation.error?.message ?? null,
    submitLog: submitMutation.mutateAsync,
    refetch: query.refetch,
  };
}
