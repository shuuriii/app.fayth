import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_PREFIX = 'draft_';

interface UseAutoSaveOptions {
  key: string;
  values: Record<string, any>;
  enabled?: boolean;
  delay?: number;
}

interface UseAutoSaveResult {
  draftRestored: boolean;
  draftSavedOpacity: Animated.Value;
  restoreDraft: () => Promise<Record<string, any> | null>;
  clearDraft: () => Promise<void>;
}

export function useAutoSave({
  key,
  values,
  enabled = true,
  delay = 800,
}: UseAutoSaveOptions): UseAutoSaveResult {
  const [draftRestored, setDraftRestored] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftSavedOpacity = useRef(new Animated.Value(0)).current;
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storageKey = `${DRAFT_PREFIX}${key}`;

  const restoreDraft = useCallback(async (): Promise<Record<string, any> | null> => {
    try {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setDraftRestored(true);
          return parsed;
        }
      }
    } catch {
      // Corrupted draft, ignore
    }
    setDraftRestored(true);
    return null;
  }, [storageKey]);

  const clearDraft = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch {
      // Ignore removal errors
    }
  }, [storageKey]);

  // Auto-save draft to AsyncStorage on value changes (debounced)
  useEffect(() => {
    if (!enabled || !draftRestored) return;

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    autosaveTimer.current = setTimeout(() => {
      if (Object.keys(values).length > 0) {
        AsyncStorage.setItem(storageKey, JSON.stringify(values))
          .then(() => {
            // Flash the "Draft saved" indicator: 0 -> 1 -> 0
            Animated.timing(draftSavedOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();

            if (flashTimer.current) clearTimeout(flashTimer.current);
            flashTimer.current = setTimeout(() => {
              Animated.timing(draftSavedOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }).start();
            }, 1500);
          })
          .catch(() => {});
      }
    }, delay);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [values, enabled, draftRestored, storageKey, delay, draftSavedOpacity]);

  // Cleanup flash timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  return {
    draftRestored,
    draftSavedOpacity,
    restoreDraft,
    clearDraft,
  };
}
