import { createSupabaseServer } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .single();

  const providerName = profile?.full_name ?? 'Provider';
  const providerRole = profile?.role ?? 'provider';

  // Today's date boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch today's sessions for this provider
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('provider_id', user.id)
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString());

  const sessionsCount = todaySessions?.length ?? 0;

  // Fetch flagged items count
  const { count: flaggedCount } = await supabase
    .from('patient_content_responses')
    .select('id', { count: 'exact', head: true })
    .eq('flagged', true)
    .eq('reviewed_by_provider_id', user.id);

  // For providers who haven't reviewed yet, also check by assigned patients
  let assignedPatientIds: string[] = [];

  if (providerRole === 'psychologist') {
    const { data: assignedPatients } = await supabase
      .from('patients')
      .select('user_id')
      .eq('assigned_psychologist_id', user.id);
    assignedPatientIds = assignedPatients?.map((p) => p.user_id) ?? [];
  } else if (providerRole === 'psychiatrist') {
    const { data: assignedPatients } = await supabase
      .from('patients')
      .select('user_id')
      .eq('assigned_psychiatrist_id', user.id);
    assignedPatientIds = assignedPatients?.map((p) => p.user_id) ?? [];
  } else if (providerRole === 'admin') {
    const { data: allPatients } = await supabase
      .from('patients')
      .select('user_id');
    assignedPatientIds = allPatients?.map((p) => p.user_id) ?? [];
  }

  // Flagged responses from assigned patients
  let totalFlagged = flaggedCount ?? 0;
  if (assignedPatientIds.length > 0) {
    const { count: patientFlaggedCount } = await supabase
      .from('patient_content_responses')
      .select('id', { count: 'exact', head: true })
      .eq('flagged', true)
      .in('patient_id', assignedPatientIds);
    totalFlagged = patientFlaggedCount ?? 0;
  }

  // Recent symptom logs from assigned patients
  let recentLogs: Array<{
    id: string;
    patient_id: string;
    logged_at: string;
    focus_score: number;
    mood_score: number;
    energy_score: number;
    notes: string | null;
  }> = [];

  if (assignedPatientIds.length > 0) {
    const { data: logs } = await supabase
      .from('symptom_logs')
      .select('id, patient_id, logged_at, focus_score, mood_score, energy_score, notes')
      .in('patient_id', assignedPatientIds)
      .order('logged_at', { ascending: false })
      .limit(5);
    recentLogs = logs ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {providerName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here is your overview for today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today's Sessions"
          value={sessionsCount}
          accent="bg-fayth-50 text-fayth-700"
        />
        <StatCard
          label="Flagged Items"
          value={totalFlagged}
          accent={
            totalFlagged > 0
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-50 text-gray-700'
          }
        />
        <StatCard
          label="Assigned Patients"
          value={assignedPatientIds.length}
          accent="bg-blue-50 text-blue-700"
        />
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recent Patient Activity
        </h2>
        {recentLogs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No recent activity from your assigned patients.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Patient {log.patient_id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.logged_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex gap-3 text-xs">
                  <ScoreBadge label="Focus" value={log.focus_score} />
                  <ScoreBadge label="Mood" value={log.mood_score} />
                  <ScoreBadge label="Energy" value={log.energy_score} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  const color =
    value >= 7
      ? 'bg-green-50 text-green-700'
      : value >= 4
        ? 'bg-yellow-50 text-yellow-700'
        : 'bg-red-50 text-red-700';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${color}`}>
      <span className="font-medium">{label}</span>
      <span>{value}/10</span>
    </span>
  );
}
