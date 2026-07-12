import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deckExistsForUser } from "@/lib/deck-query";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/signup");

  if (await deckExistsForUser(supabase, user.id)) {
    redirect("/studio");
  }

  return <SignupForm />;
}
