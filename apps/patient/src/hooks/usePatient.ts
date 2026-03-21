import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AdhdSubtype, AdjustmentStage } from '@fayth/types';

export interface Profile {
  id: string;
  user_id: string;
  role: string;
  full_name: string;
  phone: string | null;
}

export interface Patient {
  id: string;
  user_id: string;
  assigned_psychologist_id: string | null;
  assigned_psychiatrist_id: string | null;
  diagnosis_date: string | null;
  adhd_subtype: AdhdSubtype;
  adjustment_stage: AdjustmentStage;
  onboarding_complete: boolean;
  total_xp: number;
  level: string;
  daily_checkin_streak: number;
}

export interface ProviderInfo {
  full_name: string;
  role: string;
}

interface PatientData {
  profile: Profile | null;
  patient: Patient | null;
  psychologist: ProviderInfo | null;
  psychiatrist: ProviderInfo | null;
}

async function fetchPatientData(userId: string): Promise<PatientData> {
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') {
    throw profileError;
  }

  // Fetch patient record
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (patientError && patientError.code !== 'PGRST116') {
    throw patientError;
  }

  let psychologist: ProviderInfo | null = null;
  let psychiatrist: ProviderInfo | null = null;

  if (patient?.assigned_psychologist_id) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', patient.assigned_psychologist_id)
      .single();
    if (data) psychologist = data;
  }

  if (patient?.assigned_psychiatrist_id) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', patient.assigned_psychiatrist_id)
      .single();
    if (data) psychiatrist = data;
  }

  return { profile, patient, psychologist, psychiatrist };
}

export function usePatient(userId: string | undefined) {
  const query = useQuery({
    queryKey: ['patient', userId],
    queryFn: () => fetchPatientData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile: query.data?.profile ?? null,
    patient: query.data?.patient ?? null,
    psychologist: query.data?.psychologist ?? null,
    psychiatrist: query.data?.psychiatrist ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
