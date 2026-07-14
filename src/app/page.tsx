import { LandingHero } from "@/components/landing/landing-hero";
import { devAuthEnabled } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return <LandingHero skipLogin={devAuthEnabled()} />;
}
