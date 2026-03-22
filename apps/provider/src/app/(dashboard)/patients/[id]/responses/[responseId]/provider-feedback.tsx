'use client';

import { useState, useCallback } from 'react';

interface ProviderFeedbackProps {
  responseId: string;
  patientId: string;
  initialFeedback: string | null;
  initialFlagged: boolean;
}

export function ProviderFeedback({
  responseId,
  patientId,
  initialFeedback,
  initialFlagged,
}: ProviderFeedbackProps) {
  const [feedback, setFeedback] = useState(initialFeedback ?? '');
  const [flagged, setFlagged] = useState(initialFlagged);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = useCallback(async () => {
    setStatus('saving');

    try {
      const res = await fetch(
        `/api/patients/${patientId}/responses/${responseId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_feedback: feedback || undefined,
            flagged,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Failed to save');
      }

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [feedback, flagged, patientId, responseId]);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="provider-feedback"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Feedback for patient
        </label>
        <textarea
          id="provider-feedback"
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          placeholder="Write feedback for the patient about their worksheet responses..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setFlagged((prev) => !prev)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            flagged
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          }`}
          aria-pressed={flagged}
          aria-label={flagged ? 'Remove flag from response' : 'Flag response for attention'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.392l1.657-.348a6.449 6.449 0 0 1 4.271.572 7.948 7.948 0 0 0 5.965.524l2.078-.64A.75.75 0 0 0 18 12.25v-7.5a.75.75 0 0 0-.96-.72l-2.143.66a6.45 6.45 0 0 1-4.243-.372 7.949 7.949 0 0 0-5.399-.726L3.5 3.94V2.75Z" />
          </svg>
          {flagged ? 'Flagged' : 'Flag'}
        </button>

        <div className="flex items-center gap-3">
          {status === 'saved' && (
            <span className="text-sm text-green-600">Saved</span>
          )}
          {status === 'error' && (
            <span className="text-sm text-red-600">Failed to save</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'saving' ? 'Saving...' : 'Save Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
}
