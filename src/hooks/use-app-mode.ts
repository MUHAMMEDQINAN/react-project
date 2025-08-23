
"use client";

import { useState, useEffect, useCallback } from 'react';

export type AppMode = 'sandbox' | 'production';

interface UseAppModeOutput {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isLocked: boolean;
}

const APP_MODE_KEY = 'gridlens_app_mode';

// This function checks an environment variable to see if the mode is locked.
// It falls back to 'sandbox' if the variable is not set.
const getInitialMode = (): { mode: AppMode, isLocked: boolean } => {
    const lockedMode = process.env.NEXT_PUBLIC_APP_MODE;
    if (lockedMode === 'production' || lockedMode === 'sandbox') {
        return { mode: lockedMode, isLocked: true };
    }
    return { mode: 'sandbox', isLocked: false };
};


export function useAppMode(): UseAppModeOutput {
  const { mode: initialMode, isLocked } = getInitialMode();
  const [mode, setModeState] = useState<AppMode>(initialMode);

  useEffect(() => {
    // If the mode is locked by an env var, we don't need to check localStorage.
    if (isLocked) {
        setModeState(initialMode);
        return;
    }

    // This effect runs only on the client-side to get the persisted mode.
    try {
      const savedMode = localStorage.getItem(APP_MODE_KEY) as AppMode | null;
      if (savedMode && (savedMode === 'sandbox' || savedMode === 'production')) {
        setModeState(savedMode);
      } else {
        setModeState('sandbox'); // Default to sandbox if nothing is saved
      }
    } catch (error) {
      console.warn("Could not access localStorage. Defaulting to 'sandbox' mode.");
      setModeState('sandbox');
    }
  }, [isLocked, initialMode]);

  const setMode = useCallback((newMode: AppMode) => {
    if (isLocked) {
        console.warn(`App mode is locked to "${initialMode}" and cannot be changed.`);
        return;
    }
    
    try {
      localStorage.setItem(APP_MODE_KEY, newMode);
      setModeState(newMode);
      window.location.reload();
    } catch (error) {
       console.error("Failed to save app mode to localStorage.", error);
    }
  }, [isLocked, initialMode]);

  return { mode, setMode, isLocked };
}
