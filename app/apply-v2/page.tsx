import type { Metadata } from "next";
import { ApplyV2HomeContainer } from "@/components/containers/ApplyV2HomeContainer";

export const metadata: Metadata = {
  title: "인원 신청 (v2)",
};

export default function ApplyV2Page() {
  return <ApplyV2HomeContainer />;
}
