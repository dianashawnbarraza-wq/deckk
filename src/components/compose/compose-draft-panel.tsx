"use client";

import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { COMMON_TIMEZONES } from "@/lib/events";
import type { ComposeResult } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface ComposeDraftPanelProps {
  draft: ComposeResult;
  timezone: string;
  publishing: boolean;
  onUpdate: (updater: (d: ComposeResult) => ComposeResult) => void;
  onPublish: () => void;
}

export function ComposeDraftPanel({
  draft,
  timezone,
  publishing,
  onUpdate,
  onPublish,
}: ComposeDraftPanelProps) {
  return (
    <div className="mt-4 space-y-4 rounded-[1rem] border border-line bg-paper-sunken/40 p-4">
      <p className="text-sm font-medium text-ink">
        {draft.summary ?? `New ${draft.intent.replace("_", " ")}`}
      </p>

      {draft.intent === "event" && draft.event && (
        <div className="space-y-3">
          <FloatingField
            label="Title"
            placeholder="Event title"
            value={draft.event.title}
            onChange={(title) =>
              onUpdate((d) => ({
                ...d,
                event: { ...d.event!, title },
              }))
            }
          />
          <FloatingField
            label="Description"
            placeholder="What's happening?"
            value={draft.event.description ?? ""}
            onChange={(description) =>
              onUpdate((d) => ({
                ...d,
                event: { ...d.event!, description },
              }))
            }
            multiline
            rows={4}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FloatingField
              label="Starts"
              type={draft.event.isAllDay ? "date" : "datetime-local"}
              value={draft.event.startsAtLocal ?? ""}
              onChange={(startsAtLocal) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, startsAtLocal },
                }))
              }
            />
            <FloatingField
              label="Ends (optional)"
              type={draft.event.isAllDay ? "date" : "datetime-local"}
              value={draft.event.endsAtLocal ?? ""}
              onChange={(endsAtLocal) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, endsAtLocal },
                }))
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block px-1 text-xs font-medium text-ink">Timezone</label>
            <select
              value={draft.event.timezone ?? timezone}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, timezone: e.target.value },
                }))
              }
              className="flex h-11 w-full rounded-[0.625rem] border border-line bg-paper px-4 text-base focus-visible:border-brand-accent focus-visible:outline-none"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={draft.event.isAllDay ?? false}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, isAllDay: e.target.checked },
                }))
              }
            />
            All-day event
          </label>
          <FloatingField
            label="Location"
            placeholder="Venue or address"
            value={draft.event.location ?? ""}
            onChange={(location) =>
              onUpdate((d) => ({
                ...d,
                event: { ...d.event!, location },
              }))
            }
          />
          <FloatingField
            label="Ticket or info URL"
            placeholder="https://"
            type="url"
            value={draft.event.url ?? ""}
            onChange={(url) =>
              onUpdate((d) => ({
                ...d,
                event: { ...d.event!, url },
              }))
            }
          />
          <label className="flex items-center gap-2 text-base">
            <input
              type="checkbox"
              checked={draft.event.communityOptIn ?? false}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, communityOptIn: e.target.checked },
                }))
              }
            />
            Show on community calendar
          </label>
        </div>
      )}

      {draft.intent === "product" && draft.product && (
        <div className="space-y-3">
          <FloatingField
            label="Title"
            placeholder="Product name"
            value={draft.product.title}
            onChange={(title) =>
              onUpdate((d) => ({
                ...d,
                product: { ...d.product!, title },
              }))
            }
          />
          <FloatingField
            label="Description"
            placeholder="Describe your item"
            value={draft.product.description ?? ""}
            onChange={(description) =>
              onUpdate((d) => ({
                ...d,
                product: { ...d.product!, description },
              }))
            }
            multiline
            rows={4}
          />
          <FloatingField
            label="Price (USD)"
            placeholder="0.00"
            type="number"
            value={
              draft.product.priceCents
                ? (draft.product.priceCents / 100).toFixed(2)
                : ""
            }
            onChange={(raw) =>
              onUpdate((d) => ({
                ...d,
                product: {
                  ...d.product!,
                  priceCents: Math.round(Number.parseFloat(raw || "0") * 100),
                },
              }))
            }
            inputClassName={cn("[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none")}
          />
        </div>
      )}

      {draft.intent === "link" && draft.link && (
        <div className="space-y-3">
          <FloatingField
            label="Link title"
            placeholder="My link"
            value={draft.link.title}
            onChange={(title) =>
              onUpdate((d) => ({
                ...d,
                link: { ...d.link!, title },
              }))
            }
          />
          <FloatingField
            label="URL"
            placeholder="https://"
            type="url"
            value={draft.link.url}
            onChange={(url) =>
              onUpdate((d) => ({
                ...d,
                link: { ...d.link!, url },
              }))
            }
          />
        </div>
      )}

      {draft.intent === "payment_link" && draft.paymentLink && (
        <div className="space-y-3">
          <FloatingField
            label="Title"
            placeholder="Support link title"
            value={draft.paymentLink.title}
            onChange={(title) =>
              onUpdate((d) => ({
                ...d,
                paymentLink: { ...d.paymentLink!, title },
              }))
            }
          />
          {draft.paymentLink.kind === "fixed" && (
            <FloatingField
              label="Amount (USD)"
              placeholder="0.00"
              type="number"
              value={
                draft.paymentLink.amountCents
                  ? (draft.paymentLink.amountCents / 100).toFixed(2)
                  : ""
              }
              onChange={(raw) =>
                onUpdate((d) => ({
                  ...d,
                  paymentLink: {
                    ...d.paymentLink!,
                    amountCents: Math.round(Number.parseFloat(raw || "0") * 100),
                  },
                }))
              }
              inputClassName={cn("[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none")}
            />
          )}
        </div>
      )}

      <Button type="button" className="w-full" onClick={onPublish} disabled={publishing}>
        {publishing ? "Publishing…" : "Publish"}
      </Button>
    </div>
  );
}
