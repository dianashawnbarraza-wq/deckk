import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { publicDeckPath } from "@/lib/paths";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/calendar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/discover`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const supabase = createAdminClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("handle, updated_at")
      .eq("is_published", true);

    const deckUrls: MetadataRoute.Sitemap = (profiles ?? []).map((p) => ({
      url: `${base}${publicDeckPath(p.handle)}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...deckUrls];
  } catch {
    return staticEntries;
  }
}
