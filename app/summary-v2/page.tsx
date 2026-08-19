import type { Metadata } from "next";
import { SummaryV2Container } from "@/components/containers/SummaryV2Container";

export const metadata: Metadata = { title: "전체 인원 집계" };

export default function SummaryV2Page() {
  return <SummaryV2Container />;
}
