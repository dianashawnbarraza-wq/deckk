import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildEventIcs } from "@/lib/ics-event";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_published")
    .eq("id", event.profile_id)
    .single();

  if (!profile?.is_published) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const ics = buildEventIcs(event, profile.display_name);
  const filename = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
