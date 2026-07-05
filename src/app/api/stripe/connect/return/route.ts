import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("return_to") ?? "/dashboard/payments";
  return NextResponse.redirect(`${env.appUrl}${returnTo}?stripe=pending`);
}
