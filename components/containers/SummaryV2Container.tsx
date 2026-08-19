"use client";

import Link from "next/link";
import { useHeadcountSummary } from "@/hooks/useHeadcountSummary";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { BottomNavBar } from "@/components/ui/BottomNavBar";
import { DATE_LABELS, DATE_DAY_LABELS } from "@/types/application";
import type { EventDate } from "@/types/application";

export function SummaryV2Container() {
  const { summary, isLoading, error } = useHeadcountSummary();
  const grandTotal = summary.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopAppBar title="전체 인원 집계" backHref="/apply-v2" />

      <main className="flex-grow pt-20 pb-28 px-container-padding max-w-2xl mx-auto w-full">
        <section className="mb-stack-gap-md mt-stack-gap-md">
          <h2 className="text-headline-lg text-on-surface mb-2">총 신청 현황</h2>
          <p className="text-body-md text-on-surface-variant">
            날짜별 총 인원입니다. 날짜를 누르면 구역별 인원을 볼 수 있습니다.
          </p>
        </section>

        {!isLoading && !error && (
          <div className="bg-primary p-6 rounded-xl shadow-lg text-white mb-stack-gap-md">
            <span className="text-label-lg opacity-80">전체 기간 합계</span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold">{grandTotal}</span>
              <span className="text-xl opacity-90">명</span>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" className="text-error text-body-md">
            오류: {error}
          </p>
        )}
        {isLoading ? (
          <p aria-live="polite" className="text-center text-on-surface-variant py-8">
            불러오는 중...
          </p>
        ) : (
          <div className="flex flex-col gap-stack-gap-sm">
            {summary.map(({ date, count }) => (
              <Link
                key={date}
                href={`/summary-v2/${date}`}
                className="w-full text-left bg-surface-container-lowest border border-outline-variant rounded-xl p-card-inner-padding flex items-center justify-between min-h-touch-target-optimal shadow-[0px_4px_12px_rgba(0,0,0,0.05)] hover:bg-surface-container transition-colors active:scale-[0.98] duration-200"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-body-lg text-on-surface">
                    {DATE_LABELS[date as EventDate]} {DATE_DAY_LABELS[date as EventDate]}
                  </span>
                  <span className="text-label-lg text-on-surface-variant">
                    총 인원 <span className="text-primary">{count}명</span>
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNavBar activeTab="status-v2" />
    </div>
  );
}
