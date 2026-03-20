'use client';

import { useCallback, useEffect, useState } from 'react';

interface AISummaryProps {
  /** The session ID to fetch/generate a summary for. */
  sessionId: string;
  /** Optional: if provided, used to fetch patient-level summary as fallback. */
  patientId?: string;
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'loaded'; summary: string; source: 'session' | 'patient' }
  | { status: 'generating' }
  | { status: 'error'; message: string };

/**
 * Renders the AI pre-session summary for a given session.
 * Shows a "Generate Summary" button when no summary exists.
 */
export function AISummary({ sessionId, patientId }: AISummaryProps) {
  const [state, setState] = useState<SummaryState>({ status: 'loading' });

  const fetchSummary = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      // Try session-level summary first
      const sessionRes = await fetch(`/api/sessions/${sessionId}/summary`);

      if (sessionRes.ok) {
        const json = await sessionRes.json();
        setState({
          status: 'loaded',
          summary: json.data.summary,
          source: 'session',
        });
        return;
      }

      // If no session summary and we have a patientId, try patient-level
      if (patientId && sessionRes.status === 404) {
        const patientRes = await fetch(`/api/patients/${patientId}/summary`);

        if (patientRes.ok) {
          const json = await patientRes.json();
          setState({
            status: 'loaded',
            summary: json.data.summary,
            source: 'patient',
          });
          return;
        }
      }

      // No summary available
      if (sessionRes.status === 404) {
        setState({ status: 'empty' });
        return;
      }

      // Auth or other error
      const errorJson = await sessionRes.json().catch(() => null);
      setState({
        status: 'error',
        message: errorJson?.error ?? `Failed to fetch summary (${sessionRes.status})`,
      });
    } catch {
      setState({ status: 'error', message: 'Network error fetching summary' });
    }
  }, [sessionId, patientId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleGenerate = async () => {
    setState({ status: 'generating' });

    try {
      const res = await fetch(`/api/sessions/${sessionId}/summary`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        setState({
          status: 'error',
          message: errorJson?.error ?? `Generation failed (${res.status})`,
        });
        return;
      }

      const json = await res.json();
      setState({
        status: 'loaded',
        summary: json.data.summary,
        source: 'session',
      });
    } catch {
      setState({ status: 'error', message: 'Network error during generation' });
    }
  };

  // ── Loading state ──────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
    );
  }

  // ── No summary, show generate button ───────────────────────────
  if (state.status === 'empty') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-4">
          No AI pre-session summary has been generated for this session yet.
        </p>
        <button
          onClick={handleGenerate}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-fayth-600 text-white text-sm font-medium hover:bg-fayth-700 transition-colors"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  // ── Generating state ──────────────────────────────────────────
  if (state.status === 'generating') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <svg
            className="animate-spin h-4 w-4 text-fayth-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Generating AI summary... This may take a few seconds.
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <p className="text-sm text-red-600 mb-3">{state.message}</p>
        <button
          onClick={fetchSummary}
          className="text-sm text-fayth-600 hover:text-fayth-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Loaded — render the summary ───────────────────────────────
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {state.source === 'patient' && (
        <p className="text-xs text-yellow-600 mb-3">
          Showing the most recent summary from a previous session.
        </p>
      )}
      <div className="prose prose-sm max-w-none text-gray-700">
        <SummaryContent text={state.summary} />
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <button
          onClick={handleGenerate}
          className="text-xs text-gray-500 hover:text-fayth-600 transition-colors"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}

// ── Minimal markdown-like renderer ──────────────────────────────────

function SummaryContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    // Heading levels
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4
          key={i}
          className="text-sm font-semibold text-gray-900 mt-3 mb-1"
        >
          {trimmed.slice(4)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3
          key={i}
          className="text-base font-semibold text-gray-900 mt-4 mb-1"
        >
          {trimmed.slice(3)}
        </h3>
      );
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <h2
          key={i}
          className="text-lg font-bold text-gray-900 mt-4 mb-2"
        >
          {trimmed.slice(2)}
        </h2>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={i} className="ml-4 text-sm text-gray-700 list-disc">
          {trimmed.slice(2)}
        </li>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={i} className="text-sm font-semibold text-gray-800">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else {
      elements.push(
        <p key={i} className="text-sm text-gray-700">
          {trimmed}
        </p>
      );
    }
  }

  return <>{elements}</>;
}
