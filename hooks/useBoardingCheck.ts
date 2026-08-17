"use client";

import { useState, useCallback } from "react";

function storageKey(date: string): string {
  return `dinner-check:${date}`;
}

function loadChecked(date: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(date));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

interface UseDinnerCheckResult {
  checked: Set<string>;
  toggle: (key: string) => void;
  clear: () => void;
}

export function useDinnerCheck(date: string): UseDinnerCheckResult {
  const [storedDate, setStoredDate] = useState(date);
  const [checked, setChecked] = useState(() => loadChecked(date));

  if (storedDate !== date) {
    setStoredDate(date);
    setChecked(loadChecked(date));
  }

  const persist = useCallback(
    (next: Set<string>) => {
      setChecked(next);
      try {
        localStorage.setItem(storageKey(date), JSON.stringify(Array.from(next)));
      } catch {
        // localStorage unavailable — in-memory state still works for this session
      }
    },
    [date]
  );

  const toggle = useCallback(
    (key: string) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        try {
          localStorage.setItem(storageKey(date), JSON.stringify(Array.from(next)));
        } catch {
          // localStorage unavailable
        }
        return next;
      });
    },
    [date]
  );

  const clear = useCallback(() => {
    persist(new Set());
  }, [persist]);

  return { checked, toggle, clear };
}

/** @deprecated Use useDinnerCheck instead */
export type Leg = "outbound" | "return";
export function useBoardingCheck(date: string) {
  return useDinnerCheck(date);
}
