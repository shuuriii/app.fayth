import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Resolves auth.uid() → patients.id (the table PK).
 * RLS policies use get_my_patient_id() which returns patients.id,
 * so all patient-scoped queries must use this ID, not auth.uid().
 */
export function usePatientId(authUserId: string | undefined) {
  const query = useQuery({
    queryKey: ['patient-id', authUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', authUserId!)
        .single();

      if (error) throw error;
      return data.id as string;
    },
    enabled: !!authUserId,
    staleTime: 30 * 60 * 1000, // rarely changes
  });

  return {
    patientId: query.data ?? null,
    loading: query.isLoading,
  };
}
