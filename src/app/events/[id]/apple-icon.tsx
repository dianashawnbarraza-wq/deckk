import { ImageResponse } from "next/og";
import { resolvePublicEvent } from "@/lib/public-event";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function firstFlyerUrl(media: unknown): string | null {
  if (!Array.isArray(media)) return null;
  for (const m of media) {
    if (
      m &&
      typeof m === "object" &&
      typeof (m as { url?: string }).url === "string"
    ) {
      const url = (m as { url: string }).url.trim();
      if (url) return url;
    }
  }
  return null;
}

async function flyerDataUrl(media: unknown): Promise<string | null> {
  const flyer = firstFlyerUrl(media);
  if (!flyer) return null;
  try {
    const upstream = await fetch(flyer, { next: { revalidate: 3600 } });
    if (!upstream.ok) return null;
    const buf = Buffer.from(await upstream.arrayBuffer());
    const type = upstream.headers.get("content-type") || "image/jpeg";
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Apple touch icon for public event pages — first uploaded flyer. */
export default async function AppleIcon({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const event = await resolvePublicEvent(supabase, id);
  const src = await flyerDataUrl(event?.media);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1a1224",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            width={180}
            height={180}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </div>
    ),
    { ...size }
  );
}
