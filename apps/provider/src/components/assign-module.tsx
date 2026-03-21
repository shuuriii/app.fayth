'use client';

import { useCallback, useEffect, useState } from 'react';

interface ModuleInfo {
  id: string;
  chapter_number: number;
  title: string;
}

interface PatientModuleStatus {
  module_id: string;
  status: string;
  xp_earned: number;
}

interface AssignModuleProps {
  patientId: string;
  /** Pre-fetched from the server component — avoids an extra client-side fetch. */
  initialModules?: PatientModuleStatus[];
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-fayth-50 text-fayth-700',
  assigned: 'bg-yellow-50 text-yellow-700',
  complete: 'bg-green-50 text-green-700',
  locked: 'bg-gray-100 text-gray-500',
};

export function AssignModule({ patientId, initialModules }: AssignModuleProps) {
  const [allModules, setAllModules] = useState<ModuleInfo[]>([]);
  const [patientModules, setPatientModules] = useState<
    Map<string, PatientModuleStatus>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build initial patient module map
  useEffect(() => {
    if (initialModules) {
      const map = new Map<string, PatientModuleStatus>();
      initialModules.forEach((pm) => map.set(pm.module_id, pm));
      setPatientModules(map);
    }
  }, [initialModules]);

  // Fetch all 14 modules
  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch('/api/modules');
      if (!res.ok) throw new Error('Failed to fetch modules');
      const json = await res.json();
      setAllModules(json.data ?? []);
    } catch {
      // Fallback: fetch from Supabase REST directly won't work without auth.
      // We need a simple API route. For now, set empty and handle gracefully.
      setAllModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleAssign = async (moduleId: string) => {
    setAssigning(moduleId);
    setError(null);

    try {
      const res = await fetch(`/api/patients/${patientId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Failed to assign module');
        return;
      }

      // Optimistic update
      setPatientModules((prev) => {
        const next = new Map(prev);
        next.set(moduleId, {
          module_id: moduleId,
          status: 'assigned',
          xp_earned: 0,
        });
        return next;
      });
    } catch {
      setError('Network error assigning module');
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 bg-gray-100 rounded w-full" />
          <div className="h-8 bg-gray-100 rounded w-full" />
          <div className="h-8 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }

  if (allModules.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
        No modules found. Ensure YB modules are seeded in the database.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {allModules.map((mod) => {
          const pm = patientModules.get(mod.id);
          const status = pm?.status ?? 'locked';
          const isAssignable = status === 'locked';
          const isAssigningThis = assigning === mod.id;

          return (
            <div
              key={mod.id}
              className="px-4 py-3 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Ch. {mod.chapter_number} — {mod.title}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {pm?.xp_earned != null && pm.xp_earned > 0 && (
                  <span className="text-xs text-fayth-600 font-medium">
                    +{pm.xp_earned} XP
                  </span>
                )}
                {isAssignable ? (
                  <button
                    onClick={() => handleAssign(mod.id)}
                    disabled={isAssigningThis}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-fayth-600 text-white hover:bg-fayth-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigningThis ? 'Assigning...' : 'Assign'}
                  </button>
                ) : (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      STATUS_STYLES[status] ?? STATUS_STYLES.locked
                    }`}
                  >
                    {status}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
