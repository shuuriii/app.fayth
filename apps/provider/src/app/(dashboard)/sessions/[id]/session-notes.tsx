'use client';

import { useCallback, useState } from 'react';

interface SessionNotesProps {
  sessionId: string;
  initialNotes: string | null;
  initialStatus: string;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export function SessionNotes({
  sessionId,
  initialNotes,
  initialStatus,
}: SessionNotesProps) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [status, setStatus] = useState(initialStatus);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const saveNotes = useCallback(async () => {
    setSaveState('saving');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_notes: notes }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setErrorMessage(json?.error ?? `Save failed (${res.status})`);
        setSaveState('error');
        return;
      }

      setSaveState('saved');
      // Reset saved indicator after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setErrorMessage('Network error saving notes');
      setSaveState('error');
    }
  }, [sessionId, notes]);

  const markComplete = useCallback(async () => {
    setSaveState('saving');
    setErrorMessage('');

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'complete', provider_notes: notes }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setErrorMessage(json?.error ?? `Failed to mark complete (${res.status})`);
        setSaveState('error');
        return;
      }

      setStatus('complete');
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setErrorMessage('Network error updating session');
      setSaveState('error');
    }
  }, [sessionId, notes]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <label htmlFor="provider-notes" className="sr-only">
        Provider session notes
      </label>
      <textarea
        id="provider-notes"
        className="w-full min-h-[160px] rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-fayth-500 focus:ring-1 focus:ring-fayth-500 outline-none resize-y"
        placeholder="Write your session notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm">
          {saveState === 'saving' && (
            <span className="text-gray-500">Saving...</span>
          )}
          {saveState === 'saved' && (
            <span className="text-green-600">Saved successfully</span>
          )}
          {saveState === 'error' && (
            <span className="text-red-600">{errorMessage}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {status === 'scheduled' && (
            <button
              type="button"
              onClick={markComplete}
              disabled={saveState === 'saving'}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Complete
            </button>
          )}
          <button
            type="button"
            onClick={saveNotes}
            disabled={saveState === 'saving'}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-fayth-600 text-white text-sm font-medium hover:bg-fayth-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
