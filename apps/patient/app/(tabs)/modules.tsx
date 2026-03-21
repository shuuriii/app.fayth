import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePatientId } from '@/hooks/usePatientId';
import { supabase } from '@/lib/supabase';
import { ModuleCard } from '@/components/ModuleCard';
import { Colors, FontSizes, Spacing } from '@/lib/constants';
import type { ModuleStatus } from '@fayth/types';

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

  const statusMap = new Map(patientModules.map((pm) => [pm.module_id, pm.status]));

  return (ybModules ?? []).map((mod) => ({
    ...mod,
    status: statusMap.get(mod.id) ?? 'locked',
  }));
}

export default function ModulesScreen() {
  const { user } = useAuth();
  const { patientId } = usePatientId(user?.id);
  const router = useRouter();

  const { data: modules = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['modules', patientId],
    queryFn: () => fetchModules(patientId ?? undefined),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  function handleModulePress(mod: ModuleWithStatus) {
    if (mod.status === 'locked') {
      Alert.alert(
        'Module Locked',
        'This module will be unlocked by your psychologist when the time is right. Focus on your current modules for now.',
        [{ text: 'Got it' }],
      );
      return;
    }

    router.push(`/module/${mod.id}`);
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Modules</Text>
        <Text style={styles.subtitle}>
          The Young-Bramham Programme: 14 therapy modules tailored to your needs.
        </Text>
      </View>

      <FlatList
        data={modules}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ModuleCard
            chapterNumber={item.chapter_number}
            title={item.title}
            status={item.status}
            onPress={() => handleModulePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No modules available yet.</Text>
            <Text style={styles.emptySubtext}>
              Modules will appear here once your provider sets up your programme.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
