import { redirect } from "next/navigation";
import OnboardingForm from "./onboarding-form";
import { profileExistsForUser } from "@/lib/profile-query";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (await profileExistsForUser(supabase, user.id)) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
