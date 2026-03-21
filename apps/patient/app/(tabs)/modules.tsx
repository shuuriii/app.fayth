import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';
import { usePatient } from '@/hooks/usePatient';
import { supabase } from '@/lib/supabase';
import { resolveAllModuleStatuses } from '@fayth/yb-engine';
import { ModuleMap } from '@/components/map/ModuleMap';
import { Colors } from '@/lib/constants';
import type { ModuleStatus } from '@fayth/types';
import type { FayEvolutionStage } from '@fayth/types';

interface YBModule {
  id: string;
  chapter_number: number;
  title: string;
  description: string;
  sequence_order: number;
  active: boolean;
}

interface PatientModule {
  module_id: string;
  status: ModuleStatus;
}

interface ModuleWithStatus extends YBModule {
  status: ModuleStatus;
}

async function fetchModules(patientId: string | undefined): Promise<ModuleWithStatus[]> {
  const { data: ybModules, error: modError } = await supabase
    .from('yb_modules')
    .select('*')
    .eq('active', true)
    .order('sequence_order', { ascending: true });

  if (modError) throw modError;

  let patientModules: PatientModule[] = [];
  if (patientId) {
    const { data, error } = await supabase
      .from('patient_modules')
      .select('module_id, status')
      .eq('patient_id', patientId);

    if (!error && data) {
      patientModules = data;
    }
  }

  // Use yb-engine unlock logic instead of defaulting to 'active'
  const statusMap = resolveAllModuleStatuses(
    (ybModules ?? []).map((m) => ({ id: m.id, chapter_number: m.chapter_number })),
    patientModules,
  );

  return (ybModules ?? []).map((mod) => ({
    ...mod,
    status: statusMap.get(mod.id) ?? 'locked',
  }));
}

// Map player level to Fay evolution stage
const LEVEL_TO_FAY: Record<string, FayEvolutionStage> = {
  seed: 'ember',
  sapling: 'spark',
  sprout: 'glow',
  focus: 'flare',
  flow: 'radiance',
  thrive: 'lumina',
};

export default function ModulesScreen() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const { patient } = usePatient(user?.id);

  const { data: modules = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['modules', patientId],
    queryFn: () => fetchModules(patientId ?? undefined),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const level = (patient?.level ?? 'seed') as string;
  const fayEvolution = LEVEL_TO_FAY[level] ?? 'ember';

  return (
    <ModuleMap
      modules={modules}
      level={level}
      fayEvolution={fayEvolution}
      refreshing={isRefetching}
      onRefresh={() => refetch()}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
