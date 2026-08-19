import type { Metadata } from "next";
import { ZoneApplicationContainer } from "@/components/containers/ZoneApplicationContainer";
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
  return { title: `${zone ? zoneDisplayName(zone) : slug} 식사 신청` };
}

export default async function ZonePage({ params }: PageProps) {
  const { zone: slug } = await params;
  const zone = slugToZone(slug);
  if (!zone) {
    return <p className="p-6 text-error">잘못된 구역입니다.</p>;
  }
  return <ZoneApplicationContainer key={zone} zone={zone} />;
}
