"use client";

import Link from "next/link";
import { ZONES, zoneDisplayName } from "@/types/member";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { BottomNavBar } from "@/components/ui/BottomNavBar";

export function ApplyV2HomeContainer() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopAppBar title="구역별 인원 신청" titleSize="headline-lg" />

      <main className="flex-grow pt-20 pb-28 px-container-padding max-w-2xl mx-auto w-full">
        <section className="mt-stack-gap-md mb-stack-gap-md">
          <h2 className="text-display-lg text-on-surface mb-1">인원 신청</h2>
          <p className="text-body-lg text-on-surface-variant">구역을 선택해 주세요.</p>
        </section>

        <div className="grid grid-cols-3 gap-4">
          {ZONES.map((zone) => (
            <Link
              key={zone}
              href={`/apply-v2/${zone}`}
              className="aspect-square rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm flex flex-col items-center justify-center hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="text-headline-md font-bold text-on-surface">{zoneDisplayName(zone)}</span>
            </Link>
          ))}
        </div>
      </main>

      <BottomNavBar activeTab="apply-v2" />
    </div>
  );
}
