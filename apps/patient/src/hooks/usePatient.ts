import { useEffect, useState, useCallback } from 'react';
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

interface PatientState {
  profile: Profile | null;
  patient: Patient | null;
  psychologist: ProviderInfo | null;
  psychiatrist: ProviderInfo | null;
  loading: boolean;
  error: string | null;
}

export function usePatient(userId: string | undefined) {
  const [state, setState] = useState<PatientState>({
    profile: null,
    patient: null,
    psychologist: null,
    psychiatrist: null,
    loading: true,
    error: null,
  });

  const fetchPatientData = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
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

      // Fetch assigned psychologist name
      if (patient?.assigned_psychologist_id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', patient.assigned_psychologist_id)
          .single();
        if (data) psychologist = data;
      }

      // Fetch assigned psychiatrist name
      if (patient?.assigned_psychiatrist_id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('user_id', patient.assigned_psychiatrist_id)
          .single();
        if (data) psychiatrist = data;
      }

      setState({
        profile,
        patient,
        psychologist,
        psychiatrist,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message ?? 'Failed to load patient data',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  return {
    ...state,
    refetch: fetchPatientData,
  };
}
