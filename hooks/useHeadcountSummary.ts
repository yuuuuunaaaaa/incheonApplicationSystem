"use client";

import { useState, useEffect } from "react";
import type {
  HeadcountDate,
  HeadcountDateSummary,
  HeadcountZoneSummary,
} from "@/services/headcountService";

interface UseHeadcountSummaryResult {
  summary: HeadcountDateSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useHeadcountSummary(): UseHeadcountSummaryResult {
  const [summary, setSummary] = useState<HeadcountDateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("headcount_summary_v2_all");
      if (cached) {
        setSummary(JSON.parse(cached) as HeadcountDateSummary[]);
        setIsLoading(false);
      }
    } catch {}

    let cancelled = false;
    fetch("/api/summary-v2", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load summary");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setSummary(data.summary);
          try {
            sessionStorage.setItem("headcount_summary_v2_all", JSON.stringify(data.summary));
          } catch {}
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { summary, isLoading, error };
}

interface UseHeadcountDateSummaryResult {
  date: HeadcountDate | null;
  summary: HeadcountZoneSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useHeadcountDateSummary(date: string): UseHeadcountDateSummaryResult {
  const cacheKey = `headcount_summary_v2_date_${date}`;
  const [data, setData] = useState<{
    date: HeadcountDate | null;
    summary: HeadcountZoneSummary[];
  }>({ date: null, summary: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setData({ date: date as HeadcountDate, summary: JSON.parse(cached) as HeadcountZoneSummary[] });
        setIsLoading(false);
      }
    } catch {}

    let cancelled = false;
    fetch(`/api/summary-v2/${encodeURIComponent(date)}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load date summary");
        return res.json();
      })
      .then((res) => {
        if (!cancelled) {
          setData({ date: res.date, summary: res.summary });
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(res.summary));
          } catch {}
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [date, cacheKey]);

  return { ...data, isLoading, error };
}
