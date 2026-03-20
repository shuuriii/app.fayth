import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';

const STAGE_LABELS: Record<number, string> = {
  1: 'Relief & Elation',
  2: 'Confusion',
  3: 'Anger',
  4: 'Sadness & Grief',
  5: 'Anxiety',
  6: 'Acceptance',
};

const SUBTYPE_LABELS: Record<string, string> = {
  inattentive: 'Inattentive',
  hyperactive: 'Hyperactive-Impulsive',
  combined: 'Combined',
};

export default async function PatientsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = profile?.role;

  // Build the query based on provider role
  let query = supabase
    .from('patients')
    .select('user_id, adhd_subtype, adjustment_stage, diagnosis_date');

  if (role === 'psychologist') {
    query = query.eq('assigned_psychologist_id', user.id);
  } else if (role === 'psychiatrist') {
    query = query.eq('assigned_psychiatrist_id', user.id);
  }
  // admin sees all patients (no filter)

  const { data: patients, error } = await query.order('diagnosis_date', {
    ascending: false,
  });

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Failed to load patients. Please try again.
      </div>
    );
  }

  // Fetch profiles for patient names
  const patientIds = patients?.map((p) => p.user_id) ?? [];
  let patientProfiles: Record<string, { full_name: string }> = {};

  if (patientIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', patientIds);

    patientProfiles = (profiles ?? []).reduce(
      (acc, p) => {
        acc[p.user_id] = { full_name: p.full_name };
        return acc;
      },
      {} as Record<string, { full_name: string }>
    );
  }

  // Fetch last activity (most recent symptom log) per patient
  let lastActivity: Record<string, string> = {};

  if (patientIds.length > 0) {
    const { data: logs } = await supabase
      .from('symptom_logs')
      .select('patient_id, logged_at')
      .in('patient_id', patientIds)
      .order('logged_at', { ascending: false });

    (logs ?? []).forEach((log) => {
      if (!lastActivity[log.patient_id]) {
        lastActivity[log.patient_id] = log.logged_at;
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">
            {patients?.length ?? 0} patient{(patients?.length ?? 0) !== 1 ? 's' : ''} assigned to you
          </p>
        </div>
      </div>

      {!patients || patients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          No patients assigned to you yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  ADHD Subtype
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Adjustment Stage
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Last Activity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => {
                const name =
                  patientProfiles[patient.user_id]?.full_name ?? 'Unknown';
                const activity = lastActivity[patient.user_id];

                return (
                  <tr
                    key={patient.user_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/patients/${patient.user_id}`}
                        className="text-fayth-600 hover:text-fayth-700 font-medium"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {SUBTYPE_LABELS[patient.adhd_subtype] ??
                        patient.adhd_subtype ??
                        '--'}
                    </td>
                    <td className="px-4 py-3">
                      {patient.adjustment_stage ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-gray-700">
                            Stage {patient.adjustment_stage}
                          </span>
                          <span className="text-gray-400">
                            {STAGE_LABELS[patient.adjustment_stage] ?? ''}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {activity
                        ? new Date(activity).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'No activity'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
