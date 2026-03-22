import { createSupabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AISummary } from '@/components/ai-summary';
import { SessionNotes } from './session-notes';

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(
      'id, patient_id, provider_id, type, scheduled_at, duration_mins, status, provider_notes, ai_pre_session_summary, modules_worked_on'
    )
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  // Fetch patient name
  const { data: patientProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', session.patient_id)
    .single();

  const patientName = patientProfile?.full_name ?? 'Unknown Patient';
  const scheduledDate = new Date(session.scheduled_at);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/sessions"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Sessions
      </Link>

      {/* Session info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Session with {patientName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {scheduledDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              at{' '}
              {scheduledDate.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SessionTypeBadge type={session.type} />
            <SessionStatusBadge status={session.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <DetailField label="Patient" value={patientName} />
          <DetailField
            label="Type"
            value={session.type === 'therapy' ? 'Therapy' : 'Medication Review'}
          />
          <DetailField
            label="Duration"
            value={
              session.duration_mins
                ? `${session.duration_mins} minutes`
                : 'Not set'
            }
          />
          <DetailField
            label="Status"
            value={
              session.status.charAt(0).toUpperCase() + session.status.slice(1)
            }
          />
        </div>
      </div>

      {/* AI Pre-Session Summary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          AI Pre-Session Summary
        </h2>
        <AISummary sessionId={sessionId} patientId={session.patient_id} />
      </div>

      {/* Provider Notes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Session Notes
        </h2>
        <SessionNotes
          sessionId={sessionId}
          initialNotes={session.provider_notes}
          initialStatus={session.status}
        />
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
