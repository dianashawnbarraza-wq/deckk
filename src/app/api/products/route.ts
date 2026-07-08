import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";

const schema = z.object({
  profileId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priceCents: z.number().int().positive(),
  inventoryQty: z.number().int().min(0).nullable().optional(),
  images: z.array(z.string().url()).max(8).optional(),
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

  const { profileId, title, description, priceCents, inventoryQty, images } =
    parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, stripe_account_id")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      profile_id: profileId,
      title,
      description: description ?? "",
      price_cents: priceCents,
      inventory_qty: inventoryQty ?? null,
      images: images ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(publicDeckPath(profile.handle));

  return NextResponse.json({ product });
}
