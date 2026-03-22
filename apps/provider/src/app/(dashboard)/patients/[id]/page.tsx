import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { AISummary } from '@/components/ai-summary';
import { AssignModule } from '@/components/assign-module';

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

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: patientId } = await params;
  const supabase = await createSupabaseServer();

  // Fetch patient record
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('user_id, adhd_subtype, adjustment_stage, diagnosis_date, onboarding_complete')
    .eq('user_id', patientId)
    .single();

  if (patientError || !patient) {
    notFound();
  }

  // Fetch patient profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('user_id', patientId)
    .single();

  const patientName = profile?.full_name ?? 'Unknown Patient';

  // Fetch active modules
  const { data: activeModules } = await supabase
    .from('patient_modules')
    .select('module_id, status, started_at, completed_at, xp_earned')
    .eq('patient_id', patientId)
    .in('status', ['active', 'assigned', 'complete'])
    .order('module_id', { ascending: true });

  // Fetch last 7 days of symptom logs
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: symptomLogs } = await supabase
    .from('symptom_logs')
    .select(
      'id, logged_at, focus_score, mood_score, energy_score, impulsivity_score, sleep_hours, notes'
    )
    .eq('patient_id', patientId)
    .gte('logged_at', sevenDaysAgo.toISOString())
    .order('logged_at', { ascending: false });

  // Fetch the most recent session for AI summary
  const { data: latestSession } = await supabase
    .from('sessions')
    .select('id')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch recent worksheet responses
  const { data: recentResponses } = await supabase
    .from('patient_content_responses')
    .select('id, content_item_id, session_date, flagged, ai_feedback')
    .eq('patient_id', patientId)
    .order('session_date', { ascending: false })
    .limit(5);

  // Fetch content item titles for responses
  const contentItemIds = (recentResponses ?? []).map((r) => r.content_item_id);
  let contentItemTitles: Record<string, string> = {};

  if (contentItemIds.length > 0) {
    const { data: items } = await supabase
      .from('yb_content_items')
      .select('id, title')
      .in('id', contentItemIds);

    (items ?? []).forEach((item) => {
      contentItemTitles[item.id] = item.title;
    });
  }

  return (
    <div className="space-y-6">
      {/* Patient profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patientName}</h1>
            {profile?.phone && (
              <p className="text-sm text-gray-500 mt-0.5">{profile.phone}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {patient.onboarding_complete && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                Onboarded
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <DetailField
            label="ADHD Subtype"
            value={
              SUBTYPE_LABELS[patient.adhd_subtype] ??
              patient.adhd_subtype ??
              'Not set'
            }
          />
          <DetailField
            label="Diagnosis Date"
            value={
              patient.diagnosis_date
                ? new Date(patient.diagnosis_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not recorded'
            }
          />
          <DetailField
            label="Adjustment Stage"
            value={
              patient.adjustment_stage
                ? `Stage ${patient.adjustment_stage} — ${STAGE_LABELS[patient.adjustment_stage] ?? ''}`
                : 'Not assessed'
            }
          />
          <DetailField
            label="Modules Active"
            value={String(
              (activeModules ?? []).filter((m) => m.status === 'active').length
            )}
          />
        </div>
      </div>

      {/* AI Pre-Session Summary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          AI Pre-Session Summary
        </h2>
        {latestSession ? (
          <AISummary sessionId={latestSession.id} patientId={patientId} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No sessions scheduled yet. A summary can be generated once a session exists.
          </div>
        )}
      </div>

      {/* Module Assignment */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Modules</h2>
        <AssignModule
          patientId={patientId}
          initialModules={(activeModules ?? []).map((pm) => ({
            module_id: pm.module_id,
            status: pm.status,
            xp_earned: pm.xp_earned,
          }))}
        />
      </div>

      {/* Symptom Logs (Last 7 Days) */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Symptom Logs — Last 7 Days
        </h2>
        {!symptomLogs || symptomLogs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No symptom logs recorded in the past week.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">
                    Focus
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">
                    Mood
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">
                    Energy
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">
                    Impulsivity
                  </th>
                  <th className="text-center px-3 py-2.5 font-medium text-gray-600">
                    Sleep
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {symptomLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                      {new Date(log.logged_at).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <ScoreCell value={log.focus_score} />
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <ScoreCell value={log.mood_score} />
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <ScoreCell value={log.energy_score} />
                    </td>
                    <td className="text-center px-3 py-2.5">
                      <ScoreCell value={log.impulsivity_score} invert />
                    </td>
                    <td className="text-center px-3 py-2.5 text-gray-700">
                      {log.sleep_hours != null ? `${log.sleep_hours}h` : '--'}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">
                      {log.notes ?? '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Worksheet Responses */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Worksheet Responses
        </h2>
        {!recentResponses || recentResponses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No worksheet responses yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentResponses.map((response) => (
              <Link
                key={response.id}
                href={`/patients/${patientId}/responses/${response.id}`}
              >
                <div className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {contentItemTitles[response.content_item_id] ??
                        `Content #${response.content_item_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {response.session_date
                        ? new Date(response.session_date).toLocaleDateString(
                            'en-IN',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )
                        : 'No date'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {response.flagged && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        Flagged
                      </span>
                    )}
                    {response.ai_feedback && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        AI Feedback
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function ScoreCell({ value, invert }: { value: number | null; invert?: boolean }) {
  if (value == null) return <span className="text-gray-400">--</span>;

  const effective = invert ? 10 - value : value;
  const color =
    effective >= 7
      ? 'text-green-600 font-medium'
      : effective >= 4
        ? 'text-yellow-600 font-medium'
        : 'text-red-600 font-medium';

  return <span className={color}>{value}</span>;
}
