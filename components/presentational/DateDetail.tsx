"use client";

import { useState } from "react";
import type { ZoneSummaryForDate } from "@/types/application";
import { zoneDisplayName } from "@/types/member";
import type { Zone } from "@/types/member";

export interface DateDetailProps {
  date: string;
  summary: ZoneSummaryForDate[];
}

export function DateDetail({ summary }: DateDetailProps) {
  const [openZone, setOpenZone] = useState<string | null>(null);
  // const [checkMode, setCheckMode] = useState(false);
  // const { checked, toggle, clear } = useDinnerCheck(date);

  const toggleZone = (zone: string) => {
    setOpenZone((prev) => (prev === zone ? null : zone));
  };

  // const allMembers = checkMode
  //   ? summary
  //       .flatMap(({ zone, members }) => members.map((m) => ({ zone, ...m })))
  //       .sort((a, b) => a.name.localeCompare(b.name, "ko"))
  //   : [];
  // const totalRelevant = allMembers.length;
  // const totalChecked = allMembers.filter((m) => checked.has(`${m.zone}::${m.name}`)).length;

  return (
    <div className="space-y-stack-gap-sm">
      {/* 식사 체크
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCheckMode((v) => !v)}
          className={`flex items-center gap-1.5 px-3 h-9 rounded-full border text-label-lg transition-all active:scale-95 ${
            checkMode
              ? "border-primary border-2 bg-primary-fixed text-primary"
              : "border-outline-variant text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            checklist
          </span>
          식사 체크
        </button>
        {checkMode && (
          <span className="text-body-sm font-bold text-primary whitespace-nowrap">
            참석 {totalChecked}/{totalRelevant}명
          </span>
        )}
      </div>

      {checkMode && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={clear}
            className="shrink-0 h-9 px-3 rounded-full border border-outline-variant text-label-lg text-on-surface-variant active:scale-95 transition-all"
          >
            초기화
          </button>
        </div>
      )}

      {checkMode ? (
        <div className="space-y-3">
          {allMembers.length > 0 ? (
            allMembers.map(({ zone, name, isMinor }) => {
              const key = `${zone}::${name}`;
              const isChecked = checked.has(key);
              return (
                <div
                  key={key}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onClick={() => toggle(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(key);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer active:scale-[0.99] select-none ${
                    isChecked ? "bg-primary-fixed" : "bg-surface-container-low"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined ${isChecked ? "text-primary" : "text-outline"}`}
                    style={{ fontVariationSettings: isChecked ? "'FILL' 1" : undefined }}
                  >
                    {isChecked ? "check_box" : "check_box_outline_blank"}
                  </span>
                  <span className={`text-body-lg text-on-surface ${isChecked ? "font-bold" : ""}`}>{name}</span>
                  <span className="text-[11px] text-on-surface-variant shrink-0">{zone}</span>
                  <div className="ml-auto shrink-0 flex items-center gap-1.5">
                    {isMinor && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-primary text-on-primary">
                        미성년
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center py-8 text-on-surface-variant text-body-md italic">
              식사 신청자가 없습니다.
            </p>
          )}
        </div>
      ) : (
      */}

      {summary.map(({ zone, count, members }) => {
        const isOpen = openZone === zone;

        return (
          <div
            key={zone}
            className={`bg-white border rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 ${isOpen ? "border-primary ring-2 ring-primary" : "border-outline-variant"
              }`}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between p-card-inner-padding min-h-touch-target-optimal hover:bg-surface-container-low transition-colors"
              onClick={() => toggleZone(zone)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                    map
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-headline-md text-on-surface">{zoneDisplayName(zone as Zone)}</h3>
                  <p className="text-body-md text-on-surface-variant">총 {count}명 신청 완료</p>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-outline"
                style={{ transition: "transform 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                expand_more
              </span>
            </button>
            {isOpen && (
              <div className="px-card-inner-padding pb-5 space-y-3">
                {members.length > 0 ? (
                  members.map(({ name, isMinor }) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 p-3 bg-surface-container-low rounded-lg"
                    >
                      <span
                        className="material-symbols-outlined text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        person
                      </span>
                      <span className="text-body-lg text-on-surface">{name}</span>
                      <div className="ml-auto shrink-0 flex items-center gap-1.5">
                        {isMinor && (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-primary text-on-primary">
                            미성년
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-on-surface-variant text-body-md italic">
                    신청자가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* )} */}
    </div>
  );
}
