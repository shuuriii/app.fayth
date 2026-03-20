import { createSupabaseServer } from '@/lib/supabase/server';

export default async function SessionsPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date().toISOString();

  // Fetch upcoming sessions
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select(
      'id, patient_id, type, scheduled_at, duration_mins, status, ai_pre_session_summary'
    )
    .eq('provider_id', user.id)
    .gte('scheduled_at', now)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(20);

  // Fetch past sessions
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select(
      'id, patient_id, type, scheduled_at, duration_mins, status, provider_notes'
    )
    .eq('provider_id', user.id)
    .lt('scheduled_at', now)
    .order('scheduled_at', { ascending: false })
    .limit(20);

  // Gather all patient IDs to fetch names
  const allPatientIds = [
    ...new Set([
      ...(upcomingSessions ?? []).map((s) => s.patient_id),
      ...(pastSessions ?? []).map((s) => s.patient_id),
    ]),
  ];

  let patientNames: Record<string, string> = {};

  if (allPatientIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', allPatientIds);

    (profiles ?? []).forEach((p) => {
      patientNames[p.user_id] = p.full_name;
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your therapy and medication review sessions.
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
        {!upcomingSessions || upcomingSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No upcoming sessions scheduled.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="px-4 py-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {patientNames[session.patient_id] ??
                      `Patient ${session.patient_id.slice(0, 8)}...`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(session.scheduled_at).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    at{' '}
                    {new Date(session.scheduled_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {session.duration_mins && ` (${session.duration_mins} min)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SessionTypeBadge type={session.type} />
                  {session.ai_pre_session_summary && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      AI Summary Ready
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Past Sessions
        </h2>
        {!pastSessions || pastSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-500">
            No past sessions found.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="px-4 py-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {patientNames[session.patient_id] ??
                      `Patient ${session.patient_id.slice(0, 8)}...`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(session.scheduled_at).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {session.duration_mins && ` (${session.duration_mins} min)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <SessionTypeBadge type={session.type} />
                  <SessionStatusBadge status={session.status} />
                  {session.provider_notes && (
                    <span className="text-xs text-gray-400">Has notes</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SessionTypeBadge({ type }: { type: string }) {
  const isTherapy = type === 'therapy';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isTherapy
          ? 'bg-fayth-50 text-fayth-700'
          : 'bg-purple-50 text-purple-700'
      }`}
    >
      {isTherapy ? 'Therapy' : 'Med Review'}
    </span>
  );
}

function SessionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: 'bg-blue-50 text-blue-700',
    complete: 'bg-green-50 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? 'bg-gray-100 text-gray-500'
      }`}
    >
      {status}
    </span>
  );
}
