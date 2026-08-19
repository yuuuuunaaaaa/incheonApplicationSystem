"use client";

import { useState, useEffect, useCallback } from "react";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { useAuth } from "@/hooks/useAuth";
import type { Zone } from "@/types/member";
import { zoneDisplayName } from "@/types/member";

const V2_DATES = [
  { key: "2026-09-01", label: "9월 1일 (화)" },
  { key: "2026-09-02", label: "9월 2일 (수)" },
  { key: "2026-09-03", label: "9월 3일 (목)" },
  { key: "2026-09-04", label: "9월 4일 (금)" },
  { key: "2026-09-05", label: "9월 5일 (토)" },
] as const;

type DateKey = (typeof V2_DATES)[number]["key"];

interface ApplyV2ZoneContainerProps {
  zone: Zone;
}

export function ApplyV2ZoneContainer({ zone }: ApplyV2ZoneContainerProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const CACHE_KEY = `headcount_v2_cache_${zone}`;

  const [counts, setCounts] = useState<Record<DateKey, number>>(() => {
    const init = {} as Record<DateKey, number>;
    for (const d of V2_DATES) init[d.key] = 0;
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const obj = JSON.parse(cached) as Partial<Record<DateKey, number>>;
        const restored = {} as Record<DateKey, number>;
        for (const d of V2_DATES) {
          restored[d.key] = typeof obj[d.key] === "number" ? (obj[d.key] as number) : 0;
        }
        setCounts(restored);
        setLoading(false);
      }
    } catch {}

    let cancelled = false;
    fetch(`/api/headcount?zone=${encodeURIComponent(zone)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (!cancelled && res.data) {
          const next = {} as Record<DateKey, number>;
          for (const d of V2_DATES) next[d.key] = 0;
          for (const row of res.data as { zone: Zone; date: DateKey; count: number }[]) {
            if (row.zone === zone && next[row.date] !== undefined) {
              next[row.date] = row.count;
            }
          }
          setCounts(next);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(next));
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  const handleSetCount = useCallback((date: DateKey, count: number) => {
    const safe = Math.max(0, Math.floor(count));
    setCounts((prev) => ({ ...prev, [date]: safe }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const rows = V2_DATES.map((d) => ({ zone, date: d.key, count: counts[d.key] }));
      const res = await fetch("/api/headcount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("로그인이 필요합니다.");
        throw new Error("저장 실패");
      }
      setSaved(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }, [zone, counts]);

  const canEdit = isAuthenticated && !authLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopAppBar
        title={`${zoneDisplayName(zone)} 인원 신청`}
        backHref="/apply-v2"
        titleColor="on-surface"
      />

      <main className="flex-grow pt-20 pb-36 px-container-padding max-w-2xl mx-auto w-full">
        {loading ? (
          <p className="text-center text-on-surface-variant py-8">불러오는 중...</p>
        ) : (
          <div className="space-y-4 mt-4">
            {V2_DATES.map((d) => {
              const value = counts[d.key] ?? 0;
              return (
                <div
                  key={d.key}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-5 flex items-center justify-between gap-4"
                >
                  <span className="text-body-lg font-bold text-on-surface">{d.label}</span>

                  {canEdit ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`${d.label} 인원 감소`}
                        onClick={() => handleSetCount(d.key, value - 1)}
                        disabled={saving}
                        className="w-14 h-14 rounded-xl bg-secondary-container text-on-surface flex items-center justify-center active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                          remove
                        </span>
                      </button>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-label={`${d.label} 인원 입력`}
                        value={value === 0 ? "" : value}
                        placeholder="0"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          handleSetCount(d.key, raw === "" ? 0 : parseInt(raw, 10));
                        }}
                        className="w-20 h-14 text-center rounded-xl border-2 border-outline-variant bg-surface-container-lowest text-on-surface text-headline-md font-bold focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none placeholder:text-outline-variant"
                      />

                      <button
                        type="button"
                        aria-label={`${d.label} 인원 증가`}
                        onClick={() => handleSetCount(d.key, value + 1)}
                        disabled={saving}
                        className="w-14 h-14 rounded-xl bg-secondary-container text-on-surface flex items-center justify-center active:scale-95 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                          add
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-headline-md font-bold text-primary">{value}명</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {canEdit && (
        <footer className="fixed bottom-[calc(56px+1rem)] left-0 w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-40">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 ${
                saved ? "bg-outline-variant" : "bg-primary active:scale-[0.98]"
              } ${saving ? "animate-pulse" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  {saving ? "sync" : saved ? "cloud_done" : "save"}
                </span>
                <span className="text-button-text">
                  {saving ? "저장 중..." : saved ? "저장 완료" : "저장하기"}
                </span>
              </div>
            </button>
          </div>
        </footer>
      )}

      <BottomNavBar activeTab="apply-v2" />
    </div>
  );
}
