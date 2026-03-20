import React, { useEffect, useState } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ModuleCard } from '@/components/ModuleCard';
import { Colors, FontSizes, Spacing } from '@/lib/constants';
import type { ModuleStatus } from '@fayth/types';

interface YBModule {
  id: number;
  chapter_number: number;
  title: string;
  description: string;
  sequence_order: number;
  active: boolean;
}

interface PatientModule {
  module_id: number;
  status: ModuleStatus;
}

interface ModuleWithStatus extends YBModule {
  status: ModuleStatus;
}

export default function ModulesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<ModuleWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchModules() {
    try {
      // Fetch all YB modules
      const { data: ybModules, error: modError } = await supabase
        .from('yb_modules')
        .select('*')
        .eq('active', true)
        .order('sequence_order', { ascending: true });

      if (modError) throw modError;

      // Fetch patient's module assignments
      let patientModules: PatientModule[] = [];
      if (user?.id) {
        const { data, error } = await supabase
          .from('patient_modules')
          .select('module_id, status')
          .eq('patient_id', user.id);

        if (!error && data) {
          patientModules = data;
        }
      }

      // Merge: default to locked, module 1 is always unlocked
      const statusMap = new Map(patientModules.map((pm) => [pm.module_id, pm.status]));

      const merged: ModuleWithStatus[] = (ybModules ?? []).map((mod) => ({
        ...mod,
        status: statusMap.get(mod.id) ?? (mod.chapter_number === 1 ? 'assigned' : 'locked'),
      }));

      setModules(merged);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to load modules');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchModules();
  }, [user?.id]);

  function handleModulePress(mod: ModuleWithStatus) {
    if (mod.status === 'locked') {
      Alert.alert(
        'Module Locked',
        'This module will be unlocked by your psychologist when the time is right. Focus on your current modules for now.',
        [{ text: 'Got it' }]
      );
      return;
    }

    router.push(`/module/${mod.id}`);
  }

  if (loading) {
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
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchModules();
            }}
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
