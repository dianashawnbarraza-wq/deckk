import { NextResponse } from "next/server";
import { z } from "zod";
import { getReportTarget } from "@/lib/community";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimitReport } from "@/lib/rate-limit";

const schema = z.object({
  targetType: z.enum(["profile", "event"]),
  targetId: z.string().uuid(),
  reason: z.enum(["impersonation", "spam", "inappropriate", "other"]),
  details: z.string().max(1000).optional(),
  reporterEmail: z.string().email().nullable().optional(),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = await rateLimitReport(ip);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const { targetType, targetId, reason, details, reporterEmail } = parsed.data;

  const target = await getReportTarget(targetType, targetId);
  if (!target) {
    return NextResponse.json({ error: "Target not found" }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason,
    details: details ?? "",
    reporter_email: reporterEmail ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
