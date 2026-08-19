"use client";

import { useHeadcountDateSummary } from "@/hooks/useHeadcountSummary";
import { zoneDisplayName } from "@/types/member";
import type { Zone } from "@/types/member";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { DATE_LABELS, DATE_DAY_LABELS } from "@/types/application";
import type { EventDate } from "@/types/application";

interface DateDetailV2ContainerProps {
  date: string;
}

export function DateDetailV2Container({ date }: DateDetailV2ContainerProps) {
  const { summary, isLoading, error } = useHeadcountDateSummary(date);
  const label = DATE_LABELS[date as EventDate] ?? date;
  const dayLabel = DATE_DAY_LABELS[date as EventDate] ?? "";
  const totalCount = summary.reduce((sum, z) => sum + z.count, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopAppBar title={`${label} 상세 현황`} backHref="/summary-v2" />

      <main className="flex-grow pt-20 pb-28 px-container-padding max-w-2xl mx-auto w-full">
        <section className="my-stack-gap-md">
          <div className="bg-primary p-6 rounded-xl shadow-lg text-white">
            <span className="text-label-lg opacity-80">
              {label} {dayLabel} 전체 인원
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold">{isLoading ? "—" : totalCount}</span>
              <span className="text-xl opacity-90">명</span>
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="text-error text-body-md mb-4">
            오류: {error}
          </p>
        )}
        {isLoading ? (
          <p aria-live="polite" className="text-center text-on-surface-variant py-8">
            불러오는 중...
          </p>
        ) : (
          <div className="space-y-3">
            {summary.map(({ zone, count }) => (
              <div
                key={zone}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-card-inner-padding flex items-center justify-between min-h-touch-target-optimal shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>
                      map
                    </span>
                  </div>
                  <h3 className="text-headline-md text-on-surface">{zoneDisplayName(zone as Zone)}</h3>
                </div>
                <span className="text-headline-lg font-bold text-primary">{count}명</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar activeTab="status-v2" />
    </div>
  );
}
