import Link from "next/link";
import { redirect } from "next/navigation";
import { SmartComposer } from "@/components/compose/smart-composer";
import { StripeConnectBanner } from "@/components/payments/stripe-connect-banner";
import { EditorShell } from "@/components/layout/editor-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { publicDeckPath } from "@/lib/paths";
import { ProductForm } from "@/components/payments/product-form";
import { PaymentLinkForm } from "@/components/payments/payment-link-form";

interface PageProps {
  searchParams: Promise<{ stripe?: string }>;
}

export default async function PaymentsDashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  const { stripe: stripeParam } = await searchParams;

  const [productsRes, linksRes] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payment_links")
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const products = productsRes.data ?? [];
  const links = linksRes.data ?? [];

  return (
    <EditorShell title="Payments" backHref="/dashboard" backLabel="Dashboard">
      {stripeParam === "pending" && (
        <p className="mb-4 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-base">
          Stripe is reviewing your account. Payment cards stay hidden until
          charges are enabled.
        </p>
      )}
      {stripeParam === "resume" && (
        <p className="mb-4 rounded-[1rem] border border-line bg-paper-sunken px-4 py-3 text-base">
          Your onboarding link expired. Click below to resume where you left off.
        </p>
      )}

      <StripeConnectBanner
        stripeAccountId={profile.stripe_account_id}
        chargesEnabled={profile.charges_enabled}
        returnTo="/dashboard/payments"
      />

      <SmartComposer
        profileId={profile.id}
        hint="Sell something — snap a photo and say the price. Or paste a link to add to your deck."
      />

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="mb-4 font-display text-xl text-ink">Products</h2>
          <ProductForm profileId={profile.id} />
          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground">
                  ${(product.price_cents / 100).toFixed(2)}
                  {product.inventory_qty !== null &&
                    ` · ${product.inventory_qty} in stock`}
                  {!product.is_active && " · Hidden"}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-display text-xl text-ink">Payment links</h2>
          <PaymentLinkForm profileId={profile.id} />
          <div className="mt-4 space-y-3">
            {links.map((link) => (
              <Card key={link.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {link.title}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      ({link.kind})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-base text-muted-foreground">
                  {link.kind === "fixed" && link.amount_cents
                    ? `$${(link.amount_cents / 100).toFixed(2)}`
                    : link.kind === "tip"
                      ? "Open amount ($1–$500)"
                      : ""}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <p className="text-base text-muted-foreground">
          Preview your deck:{" "}
          <Link
            href={publicDeckPath(profile.handle)}
            className="text-brand-accent-strong underline-offset-4 hover:underline"
          >
            deckk.me/{profile.handle}
          </Link>
        </p>
      </div>
    </EditorShell>
  );
}
