"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_TIMEZONES } from "@/lib/events";
import type { ComposeResult } from "@/lib/ai/types";

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
          <div>
            <Label>Title</Label>
            <Input
              value={draft.event.title}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, title: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={draft.event.description ?? ""}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, description: e.target.value },
                }))
              }
              rows={4}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Starts</Label>
              <Input
                type={draft.event.isAllDay ? "date" : "datetime-local"}
                value={draft.event.startsAtLocal ?? ""}
                onChange={(e) =>
                  onUpdate((d) => ({
                    ...d,
                    event: { ...d.event!, startsAtLocal: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label>Ends (optional)</Label>
              <Input
                type={draft.event.isAllDay ? "date" : "datetime-local"}
                value={draft.event.endsAtLocal ?? ""}
                onChange={(e) =>
                  onUpdate((d) => ({
                    ...d,
                    event: { ...d.event!, endsAtLocal: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <div>
            <Label>Timezone</Label>
            <select
              value={draft.event.timezone ?? timezone}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, timezone: e.target.value },
                }))
              }
              className="flex h-11 w-full rounded-[0.625rem] border border-line bg-paper px-4 text-base"
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
          <div>
            <Label>Location</Label>
            <Input
              value={draft.event.location ?? ""}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, location: e.target.value },
                }))
              }
              placeholder="Venue or address"
            />
          </div>
          <div>
            <Label>Ticket or info URL</Label>
            <Input
              type="url"
              value={draft.event.url ?? ""}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  event: { ...d.event!, url: e.target.value },
                }))
              }
              placeholder="https://"
            />
          </div>
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
          <div>
            <Label>Title</Label>
            <Input
              value={draft.product.title}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  product: { ...d.product!, title: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={draft.product.description ?? ""}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  product: { ...d.product!, description: e.target.value },
                }))
              }
              rows={4}
            />
          </div>
          <div>
            <Label>Price (USD)</Label>
            <Input
              type="number"
              min={0.01}
              step={0.01}
              value={
                draft.product.priceCents
                  ? (draft.product.priceCents / 100).toFixed(2)
                  : ""
              }
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  product: {
                    ...d.product!,
                    priceCents: Math.round(Number.parseFloat(e.target.value) * 100),
                  },
                }))
              }
            />
          </div>
        </div>
      )}

      {draft.intent === "link" && draft.link && (
        <div className="space-y-3">
          <div>
            <Label>Link title</Label>
            <Input
              value={draft.link.title}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  link: { ...d.link!, title: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>URL</Label>
            <Input
              type="url"
              value={draft.link.url}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  link: { ...d.link!, url: e.target.value },
                }))
              }
            />
          </div>
        </div>
      )}

      {draft.intent === "payment_link" && draft.paymentLink && (
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={draft.paymentLink.title}
              onChange={(e) =>
                onUpdate((d) => ({
                  ...d,
                  paymentLink: { ...d.paymentLink!, title: e.target.value },
                }))
              }
            />
          </div>
          {draft.paymentLink.kind === "fixed" && (
            <div>
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={
                  draft.paymentLink.amountCents
                    ? (draft.paymentLink.amountCents / 100).toFixed(2)
                    : ""
                }
                onChange={(e) =>
                  onUpdate((d) => ({
                    ...d,
                    paymentLink: {
                      ...d.paymentLink!,
                      amountCents: Math.round(Number.parseFloat(e.target.value) * 100),
                    },
                  }))
                }
              />
            </div>
          )}
        </div>
      )}

      <Button type="button" className="w-full" onClick={onPublish} disabled={publishing}>
        {publishing ? "Publishing…" : "Publish to deck"}
      </Button>
    </div>
  );
}
