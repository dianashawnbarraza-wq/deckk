export type PrimaryCtaType = "shop" | "support" | "book" | "custom";
export type BlockCategory =
  | "shop"
  | "social"
  | "listen"
  | "read"
  | "book"
  | "community"
  | "contact"
  | "custom";
export type PaymentLinkKind = "tip" | "fixed" | "fundraiser";
export type OrderStatus = "paid" | "refunded" | "failed";

export interface Profile {
  id: string;
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  header_url: string | null;
  primary_cta_type: PrimaryCtaType;
  primary_cta_ref: string | null;
  theme: Record<string, unknown>;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  community_opt_in: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  profile_id: string;
  category: BlockCategory;
  title: string;
  url: string | null;
  icon: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  inventory_qty: number | null;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentLink {
  id: string;
  profile_id: string;
  kind: PaymentLinkKind;
  title: string;
  amount_cents: number | null;
  goal_cents: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  profile_id: string;
  product_id: string | null;
  payment_link_id: string | null;
  buyer_email: string;
  stripe_payment_intent: string;
  amount_cents: number;
  currency: string;
  application_fee_cents: number;
  status: OrderStatus;
  line_items: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  is_all_day: boolean;
  location: string | null;
  is_online: boolean;
  url: string | null;
  cover_url: string | null;
  community_opt_in: boolean;
  city: string | null;
  is_canceled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ReportTargetType = "profile" | "event";
export type ReportStatus = "pending" | "reviewed" | "actioned";

export interface Report {
  id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details: string;
  reporter_email: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface PublicDeck {
  profile: Profile;
  blocks: Block[];
  products: Product[];
  paymentLinks: PaymentLink[];
  events: Event[];
}
