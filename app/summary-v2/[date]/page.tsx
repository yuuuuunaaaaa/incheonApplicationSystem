import type { Metadata } from "next";
import { DateDetailV2Container } from "@/components/containers/DateDetailV2Container";
import { DATE_LABELS, EVENT_DATES } from "@/types/application";
import type { EventDate } from "@/types/application";

interface PageProps {
  params: Promise<{ date: string }>;
}

export function generateStaticParams() {
  return EVENT_DATES.map((date) => ({ date }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { date } = await params;
  const label = DATE_LABELS[date as EventDate] ?? date;
  return { title: `${label} 인원 현황` };
}

export default async function DateDetailV2Page({ params }: PageProps) {
  const { date } = await params;
  return <DateDetailV2Container date={date} />;
}
