import type { Metadata } from "next";
import { ApplyV2ZoneContainer } from "@/components/containers/ApplyV2ZoneContainer";
import { slugToZone, getAllZoneSlugs } from "@/lib/zoneSlugV2";
import { zoneDisplayName } from "@/types/member";

interface PageProps {
  params: Promise<{ zone: string }>;
}

export function generateStaticParams() {
  return getAllZoneSlugs().map((slug) => ({ zone: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zone: slug } = await params;
  const zone = slugToZone(slug);
  return { title: `${zone ? zoneDisplayName(zone) : slug} 인원 신청` };
}

export default async function ApplyV2ZonePage({ params }: PageProps) {
  const { zone: slug } = await params;
  const zone = slugToZone(slug);
  if (!zone) {
    return <p className="p-6 text-error">잘못된 구역입니다.</p>;
  }
  return <ApplyV2ZoneContainer zone={zone} />;
}
