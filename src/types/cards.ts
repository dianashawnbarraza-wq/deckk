export type CardType = "event" | "item" | "announcement" | "link" | "collection";
export type CardStatus = "draft" | "live" | "archived";
export type CardSource = "manual" | "extracted";

export interface DeckTheme {
  accent?: string;
  dark?: boolean;
  /** Public deck appearance. Prefer this over `dark` when present. */
  appearance?: "dark" | "light" | "lilac";
  pronouns?: string;
  location?: string;
  /** Set after first-run photo / bio / socials wizard. */
  onboarding_complete?: boolean;
  /** Ordered custom shop category chips (All is always implied). */
  shopCategories?: { id: string; label: string }[];
}

export interface Deck {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  theme: DeckTheme;
  timezone: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CardMedia {
  url: string;
  alt?: string;
}

export interface Card {
  id: string;
  deck_id: string;
  type: CardType;
  title: string;
  description: string | null;
  media: CardMedia[];
  date_start: string | null;
  date_end: string | null;
  location_name: string | null;
  location_address: string | null;
  cta_label: string | null;
  cta_url: string | null;
  price: number | null;
  currency: string | null;
  tags: string[];
  pinned: boolean;
  /** Starred shop item — appear in Featured (max 4 per deck). Optional until migration applied. */
  featured?: boolean;
  status: CardStatus;
  position: number | null;
  source: CardSource;
  extraction_confidence: Record<string, number> | null;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  /** Directory / ticketing (optional until migration applied). */
  city?: string | null;
  directory_opt_in?: boolean;
  ticket_price_cents?: number | null;
  ticket_capacity?: number | null;
  tickets_sold?: number;
  ticketing_enabled?: boolean;
  /** Public URL slug for /events/[slug] (optional until migration). */
  slug?: string | null;
  /** Co-hosts shown on the public event page (optional until migration). */
  hosts?: { name: string; handle?: string | null; note?: string | null }[];
}

export type PublicTab = "home" | "events" | "shop" | "adult" | "listen" | "writing";
