import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey());
  }
  return resendClient;
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export async function sendOrderConfirmationEmails(params: {
  buyerEmail: string;
  creatorEmail: string;
  creatorName: string;
  handle: string;
  itemTitle: string;
  amountCents: number;
  orderId: string;
}) {
  const resend = getResend();
  const from = env.resendFromEmail();
  const amount = formatUsd(params.amountCents);
  const deckUrl = `${env.appUrl}/@${params.handle}`;

  await Promise.all([
    resend.emails.send({
      from,
      to: params.buyerEmail,
      subject: `Order confirmed — ${params.itemTitle}`,
      text: [
        `Thanks for your purchase!`,
        ``,
        `Item: ${params.itemTitle}`,
        `Amount: ${amount}`,
        `Order ID: ${params.orderId}`,
        ``,
        `You bought from ${params.creatorName} on deckk.me.`,
        `View their deck: ${deckUrl}`,
      ].join("\n"),
    }),
    resend.emails.send({
      from,
      to: params.creatorEmail,
      subject: `New order — ${params.itemTitle}`,
      text: [
        `You received a new order on deckk.me!`,
        ``,
        `Item: ${params.itemTitle}`,
        `Amount: ${amount}`,
        `Buyer: ${params.buyerEmail}`,
        `Order ID: ${params.orderId}`,
        ``,
        `Manage your deck: ${env.appUrl}/dashboard`,
      ].join("\n"),
    }),
  ]);
}

export async function sendInventoryRefundEmails(params: {
  buyerEmail: string;
  creatorEmail: string;
  creatorName: string;
  itemTitle: string;
  amountCents: number;
}) {
  const resend = getResend();
  const from = env.resendFromEmail();
  const amount = formatUsd(params.amountCents);

  await Promise.all([
    resend.emails.send({
      from,
      to: params.buyerEmail,
      subject: `Refund issued — ${params.itemTitle}`,
      text: [
        `We're sorry — ${params.itemTitle} sold out before your payment could be fulfilled.`,
        ``,
        `A full refund of ${amount} has been issued to your payment method.`,
        ``,
        `Thank you for your understanding.`,
      ].join("\n"),
    }),
    resend.emails.send({
      from,
      to: params.creatorEmail,
      subject: `Auto-refund — ${params.itemTitle} out of stock`,
      text: [
        `An order for "${params.itemTitle}" (${amount}) was auto-refunded because inventory was depleted.`,
        ``,
        `Consider updating your stock quantity in the dashboard.`,
      ].join("\n"),
    }),
  ]);
}
