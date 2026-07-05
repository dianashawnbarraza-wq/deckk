import { createAdminClient } from "@/lib/supabase/admin";
import type { Event, Profile } from "@/types/database";

export interface CommunityEvent extends Event {
  profile: Pick<Profile, "handle" | "display_name" | "avatar_url">;
}

export interface DirectoryProfile extends Profile {
  upcoming_event_count?: number;
}

export interface CalendarFilters {
  city?: string;
  online?: boolean;
  from?: string;
  to?: string;
}

export async function getCommunityEvents(
  filters: CalendarFilters = {}
): Promise<CommunityEvent[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  let query = supabase
    .from("events")
    .select(
      "*, profiles!inner(handle, display_name, avatar_url, is_published)"
    )
    .eq("community_opt_in", true)
    .eq("is_active", true)
    .eq("is_canceled", false)
    .eq("profiles.is_published", true)
    .order("starts_at", { ascending: true });

  if (filters.from) {
    query = query.gte("starts_at", filters.from);
  } else {
    query = query.or(`ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`);
  }

  if (filters.to) {
    query = query.lte("starts_at", filters.to);
  }
  if (filters.city) {
    query = query.ilike("city", `%${filters.city}%`);
  }
  if (filters.online === true) {
    query = query.eq("is_online", true);
  } else if (filters.online === false) {
    query = query.eq("is_online", false);
  }

  const { data, error } = await query;
  if (error) throw error;

  const events = (data ?? [])
    .map((row) => {
      const { profiles, ...event } = row as Event & {
        profiles: Pick<Profile, "handle" | "display_name" | "avatar_url">;
      };
      const cutoff = event.ends_at ?? event.starts_at;
      if (new Date(cutoff) < new Date()) return null;
      return { ...event, profile: profiles };
    })
    .filter((e): e is CommunityEvent => e !== null);

  return events;
}

export async function getCommunityCities(): Promise<string[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("events")
    .select("city, profiles!inner(is_published)")
    .eq("community_opt_in", true)
    .eq("is_active", true)
    .eq("is_canceled", false)
    .eq("profiles.is_published", true)
    .gte("starts_at", now)
    .not("city", "is", null);

  const cities = new Set<string>();
  for (const row of data ?? []) {
    if (row.city) cities.add(row.city);
  }
  return [...cities].sort((a, b) => a.localeCompare(b));
}

export async function getDirectoryProfiles(
  search?: string
): Promise<DirectoryProfile[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("is_published", true)
    .eq("community_opt_in", true)
    .order("display_name", { ascending: true });

  if (search?.trim()) {
    const escaped = search.trim().replace(/[%_]/g, "\\$&");
    const term = `%${escaped}%`;
    query = query.or(
      `handle.ilike.${term},display_name.ilike.${term},bio.ilike.${term}`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getReportTarget(
  targetType: "profile" | "event",
  targetId: string
): Promise<{ id: string; label: string } | null> {
  const supabase = createAdminClient();

  if (targetType === "profile") {
    const { data } = await supabase
      .from("profiles")
      .select("id, handle, display_name, is_published")
      .eq("id", targetId)
      .eq("is_published", true)
      .maybeSingle();
    if (!data) return null;
    return { id: data.id, label: `@${data.handle} (${data.display_name})` };
  }

  const { data } = await supabase
    .from("events")
    .select("id, title, is_active, profiles!inner(is_published)")
    .eq("id", targetId)
    .eq("is_active", true)
    .eq("profiles.is_published", true)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, label: data.title };
}
