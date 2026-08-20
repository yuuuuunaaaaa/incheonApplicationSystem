import { redirect } from "next/navigation";
import { HomeContainer } from "@/components/containers/HomeContainer";
import { isAuthenticated } from "@/lib/auth";

export default async function HomePage() {
  if (await isAuthenticated()) {
    redirect("/apply-v2");
  }

  return <HomeContainer />;
}
