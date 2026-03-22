import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { createSupabaseAdmin } from '@/lib/supabase/admin';
import { ProviderFeedback } from './provider-feedback';

interface SchemaField {
  id: string;
  label: string;
  type: string;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: Record<string, string>;
}

interface ContentItemSchema {
  fields?: SchemaField[];
  scoring?: { method: string; interpretation?: Record<string, string> };
  instructions_for_patient?: string;
  clinician_notes?: string;
}

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  worksheet: { bg: 'bg-purple-50', text: 'text-purple-700' },
  table: { bg: 'bg-blue-50', text: 'text-blue-700' },
  exercise: { bg: 'bg-green-50', text: 'text-green-700' },
  diary: { bg: 'bg-amber-50', text: 'text-amber-700' },
  psychoeducation: { bg: 'bg-gray-50', text: 'text-gray-600' },
};

export default async function ResponseDetailPage({
  params,
}: {
  params: Promise<{ id: string; responseId: string }>;
}) {
  const { id: patientId, responseId } = await params;

  const supabase = await createSupabaseServer();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    notFound();
  }

  const admin = createSupabaseAdmin();

  // Fetch the response
  const { data: response, error: responseError } = await admin
    .from('patient_content_responses')
    .select('id, patient_id, content_item_id, session_date, response_data, ai_feedback, reviewed_by_provider_id, flagged')
    .eq('id', responseId)
    .eq('patient_id', patientId)
    .single();

  if (responseError || !response) {
    notFound();
  }

  // Fetch the content item
  const { data: contentItem } = await admin
    .from('yb_content_items')
    .select('id, module_id, type, title, instructions, schema, xp_value')
    .eq('id', response.content_item_id)
    .single();

  // Fetch patient name for breadcrumb
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('user_id', patientId)
    .single();

  const patientName = profile?.full_name ?? 'Patient';
  const itemTitle = contentItem?.title ?? 'Unknown Content Item';
  const itemType = contentItem?.type ?? 'worksheet';
  const badge = TYPE_BADGES[itemType] ?? TYPE_BADGES.worksheet;
  const schema: ContentItemSchema | null = contentItem?.schema as ContentItemSchema | null;
  const responseData: Record<string, unknown> = (response.response_data as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      {/* Breadcrumb / back link */}
      <div>
        <Link
          href={`/patients/${patientId}`}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          &larr; Back to {patientName}
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{itemTitle}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
              >
                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
              </span>
            </div>
            {response.session_date && (
              <p className="text-sm text-gray-500 mt-1">
                Submitted on{' '}
                {new Date(response.session_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          {response.flagged && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
              Flagged
            </span>
          )}
        </div>

        {/* Instructions */}
        {contentItem?.instructions && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Instructions
            </p>
            <p className="text-sm text-gray-700">{contentItem.instructions}</p>
          </div>
        )}

        {/* Clinician notes */}
        {schema?.clinician_notes && (
          <div className="mt-3 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
              Clinician Notes
            </p>
            <p className="text-sm text-amber-800">{schema.clinician_notes}</p>
          </div>
        )}
      </div>

      {/* Response fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Patient Responses
        </h2>

        {!schema?.fields || schema.fields.length === 0 ? (
          <p className="text-sm text-gray-500">
            This content item does not have structured fields. Raw response data
            is shown below.
          </p>
        ) : (
          <div className="space-y-5">
            {schema.fields.map((field) => (
              <ResponseField
                key={field.id}
                field={field}
                value={responseData[field.id]}
              />
            ))}
          </div>
        )}

        {/* Fallback: show raw response data if no schema fields */}
        {(!schema?.fields || schema.fields.length === 0) &&
          Object.keys(responseData).length > 0 && (
            <pre className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          )}
      </div>

      {/* Provider feedback section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Provider Feedback
        </h2>
        <ProviderFeedback
          responseId={responseId}
          patientId={patientId}
          initialFeedback={response.ai_feedback ?? null}
          initialFlagged={response.flagged ?? false}
        />
      </div>
    </div>
  );
}

// ── Field renderer ───────────────────────────────────────────────────

function ResponseField({
  field,
  value,
}: {
  field: SchemaField;
  value: unknown;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{field.label}</p>
      <div className="mt-1">
        <ResponseValue field={field} value={value} />
      </div>
    </div>
  );
}

function ResponseValue({
  field,
  value,
}: {
  field: SchemaField;
  value: unknown;
}) {
  if (value === undefined || value === null || value === '') {
    return <p className="text-sm text-gray-400 italic">No response</p>;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
      return (
        <p className="text-sm text-gray-900 whitespace-pre-wrap">
          {String(value)}
        </p>
      );

    case 'number':
      return <p className="text-sm text-gray-900">{String(value)}</p>;

    case 'scale': {
      const num = Number(value);
      const max = field.scale_max ?? 10;
      const scaleLabel = field.scale_labels?.[String(num)];
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {num} / {max}
          </span>
          {scaleLabel && (
            <span className="text-sm text-gray-500">&mdash; {scaleLabel}</span>
          )}
        </div>
      );
    }

    case 'likert':
    case 'select':
      return <p className="text-sm text-gray-900">{String(value)}</p>;

    case 'checkbox': {
      const items = Array.isArray(value) ? value : [value];
      return (
        <p className="text-sm text-gray-900">{items.join(', ')}</p>
      );
    }

    case 'time':
      return <p className="text-sm text-gray-900">{String(value)}</p>;

    case 'date': {
      const dateStr = String(value);
      try {
        const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        return <p className="text-sm text-gray-900">{formatted}</p>;
      } catch {
        return <p className="text-sm text-gray-900">{dateStr}</p>;
      }
    }

    default:
      return <p className="text-sm text-gray-900">{String(value)}</p>;
  }
}
