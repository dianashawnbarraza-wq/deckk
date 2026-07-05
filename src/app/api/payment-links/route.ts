import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  profileId: z.string().uuid(),
  kind: z.enum(["tip", "fixed"]),
  title: z.string().min(1).max(100),
  amountCents: z.number().int().positive().nullable().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { profileId, kind, title, amountCents } = parsed.data;

  if (kind === "fixed" && !amountCents) {
    return NextResponse.json(
      { error: "Fixed links require an amount" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, stripe_account_id")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: link, error } = await supabase
    .from("payment_links")
    .insert({
      profile_id: profileId,
      kind,
      title,
      amount_cents: kind === "fixed" ? amountCents : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/@${profile.handle}`);

  return NextResponse.json({ link });
}
