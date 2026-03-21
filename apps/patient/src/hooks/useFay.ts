import { useState, useCallback, useMemo } from 'react';
import type { Level } from '@fayth/types';
import type { FayState } from '@fayth/types';
import { resolveFayState, getCelebrationMessage } from '@fayth/yb-engine';
import type { FayContext } from '@fayth/yb-engine';

interface UseFayOptions {
  level: Level;
  streakDays: number;
  todayLogComplete: boolean;
  daysSinceLastOpen: number;
  lastFocusScore?: number;
  lastMoodScore?: number;
  dailyActionsComplete: boolean;
  activeTask?: boolean;
}

interface UseFayReturn {
  state: FayState;
  /** Whether Fay's message tooltip is showing */
  messageVisible: boolean;
  /** Toggle message tooltip (one-tap interaction) */
  toggleMessage: () => void;
  /** Dismiss message tooltip */
  dismissMessage: () => void;
  /** Get a celebration message after completing an action */
  celebrate: (action: 'log' | 'worksheet' | 'medication', streakDays?: number) => {
    message: string | null;
    streakMessage: string | null;
  };
}

/**
 * Hook that resolves Fay's state from the current patient context.
 * The UI layer calls this once and renders accordingly.
 */
export function useFay(options: UseFayOptions): UseFayReturn {
  const [messageVisible, setMessageVisible] = useState(false);

  const ctx: FayContext = useMemo(
    () => ({
      level: options.level,
      streakDays: options.streakDays,
      todayLogComplete: options.todayLogComplete,
      daysSinceLastOpen: options.daysSinceLastOpen,
      lastFocusScore: options.lastFocusScore,
      lastMoodScore: options.lastMoodScore,
      dailyActionsComplete: options.dailyActionsComplete,
      activeTask: options.activeTask ?? false,
    }),
    [
      options.level,
      options.streakDays,
      options.todayLogComplete,
      options.daysSinceLastOpen,
      options.lastFocusScore,
      options.lastMoodScore,
      options.dailyActionsComplete,
      options.activeTask,
    ]
  );

  const state = useMemo(() => resolveFayState(ctx), [ctx]);

  const toggleMessage = useCallback(() => {
    setMessageVisible((prev) => !prev);
  }, []);

  const dismissMessage = useCallback(() => {
    setMessageVisible(false);
  }, []);

  const celebrate = useCallback(
    (action: 'log' | 'worksheet' | 'medication', streakDays?: number) => {
      const result = getCelebrationMessage(action, streakDays);
      return {
        message: result.message?.text ?? null,
        streakMessage: result.streakMessage?.text ?? null,
      };
    },
    []
  );

  return {
    state,
    messageVisible,
    toggleMessage,
    dismissMessage,
    celebrate,
  };
}
