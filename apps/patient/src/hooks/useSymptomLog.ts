import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SymptomLogInput } from '@fayth/types';

interface SymptomLog extends SymptomLogInput {
  id: string;
  patient_id: string;
  logged_at: string;
}

interface SymptomLogState {
  todayLog: SymptomLog | null;
  recentLogs: SymptomLog[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export function useSymptomLog(userId: string | undefined) {
  const [state, setState] = useState<SymptomLogState>({
    todayLog: null,
    recentLogs: [],
    loading: true,
    submitting: false,
    error: null,
  });

  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const sevenDaysAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 7
      ).toISOString();

      // Check if logged today
      const { data: todayData, error: todayError } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('patient_id', userId)
        .gte('logged_at', todayStart)
        .order('logged_at', { ascending: false })
        .limit(1);

      if (todayError) throw todayError;

      // Fetch last 7 days
      const { data: recentData, error: recentError } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('patient_id', userId)
        .gte('logged_at', sevenDaysAgo)
        .order('logged_at', { ascending: false });

      if (recentError) throw recentError;

      setState({
        todayLog: todayData && todayData.length > 0 ? todayData[0] : null,
        recentLogs: recentData ?? [],
        loading: false,
        submitting: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? 'Failed to fetch logs',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const submitLog = useCallback(
    async (input: SymptomLogInput) => {
      if (!userId) return;

      setState((prev) => ({ ...prev, submitting: true, error: null }));

      try {
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

        // Refresh logs after submission
        await fetchLogs();
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          submitting: false,
          error: err.message ?? 'Failed to submit log',
        }));
        throw err;
      }
    },
    [userId, fetchLogs]
  );

  return {
    ...state,
    submitLog,
    refetch: fetchLogs,
  };
}
