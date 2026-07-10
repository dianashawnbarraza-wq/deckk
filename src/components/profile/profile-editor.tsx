"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/profile/avatar";

interface ProfileEditorProps {
  handle: string;
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
}

export function ProfileEditor({
  handle,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
}: ProfileEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setAvatarUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const showAvatar = previewUrl ?? avatarUrl;

  return (
    <section className="rounded-[1rem] border border-line bg-paper p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl leading-tight text-ink">Your profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            deckk.me/{handle}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={save} disabled={saving || uploading}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
      />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative shrink-0 self-start"
          aria-label="Change profile photo"
        >
          {showAvatar ? (
            <div className="relative size-24 overflow-hidden rounded-[1rem] ring-1 ring-line">
              <Image
                src={showAvatar}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <Avatar size="lg" className="size-24" />
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-[1rem] bg-ink/0 text-paper opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
            <Camera className="size-6" />
          </span>
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center rounded-[1rem] bg-paper/80">
              <Loader2 className="size-6 animate-spin text-ink" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you appear on your deck"
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A line or two about you — shows on your public deck"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {saved && (
        <p className="mt-3 text-sm text-muted-foreground">Profile saved.</p>
      )}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
