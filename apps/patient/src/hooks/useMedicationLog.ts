import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';
import { useAwardXP } from '@/hooks/useAwardXP';

interface Medication {
  id: string;
  name: string;
  dose_mg: number;
  frequency: string;
  form: string | null;
  active: boolean;
}

interface MedicationLog {
  id: string;
  patient_id: string;
  medication_id: string;
  taken_at: string;
  missed: boolean;
  side_effects: string[];
}

async function fetchMedications(patientId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('id, name, dose_mg, frequency, form, active')
    .eq('patient_id', patientId)
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Medication[];
}

async function fetchTodayLogs(patientId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('taken_at', todayStart.toISOString())
    .order('taken_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MedicationLog[];
}

export function useMedications(patientId: string | undefined) {
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => fetchMedications(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTodayMedicationLogs(patientId: string | undefined) {
  return useQuery({
    queryKey: ['medication-logs-today', patientId],
    queryFn: () => fetchTodayLogs(patientId!),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLogMedication() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const queryClient = useQueryClient();
  const awardXP = useAwardXP();

  return useMutation({
    mutationFn: async ({
      medicationId,
      missed,
      sideEffects,
    }: {
      medicationId: string;
      missed?: boolean;
      sideEffects?: string[];
    }) => {
      if (!patientId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          patient_id: patientId,
          medication_id: medicationId,
          taken_at: new Date().toISOString(),
          missed: missed ?? false,
          side_effects: sideEffects ?? [],
        })
        .select()
        .single();

      if (error) throw error;

      // Award XP only if medication was actually taken (not missed)
      if (!missed) {
        awardXP.mutate({ action: 'take_medication' });
      }

      return data as MedicationLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-logs-today', patientId] });
    },
  });
}
