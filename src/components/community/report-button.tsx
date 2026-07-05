"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReportTargetType } from "@/types/database";

const REASONS = [
  { value: "impersonation", label: "Impersonation or fake account" },
  { value: "spam", label: "Spam or off-topic" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
] as const;

interface ReportButtonProps {
  targetType: ReportTargetType;
  targetId: string;
  targetLabel: string;
}

export function ReportButton({
  targetType,
  targetId,
  targetLabel,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          details,
          reporterEmail: email || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit report");
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setDone(false);
      setError("");
      setDetails("");
      setEmail("");
      setReason(REASONS[0].value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Report
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
          <DialogDescription>
            Flag {targetLabel} for review. Reports are reviewed by the deckk.me
            team.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <p className="text-sm text-muted-foreground">
            Thanks — your report was submitted. We&apos;ll review it shortly.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="report-reason">Reason</Label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              >
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="report-details">Details (optional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={1000}
                placeholder="Tell us more…"
              />
            </div>
            <div>
              <Label htmlFor="report-email">Your email (optional)</Label>
              <Input
                id="report-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting…" : "Submit report"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
