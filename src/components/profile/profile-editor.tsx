"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { DeckHeroHeader } from "@/components/deck/deck-hero-header";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { Avatar } from "@/components/profile/avatar";

interface ProfileEditorProps {
  handle: string;
  initialDisplayName: string;
  initialBio: string;
  initialAvatarUrl: string | null;
  initialHeaderUrl: string | null;
}

export function ProfileEditor({
  handle,
  initialDisplayName,
  initialBio,
  initialAvatarUrl,
  initialHeaderUrl,
}: ProfileEditorProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [headerUrl, setHeaderUrl] = useState(initialHeaderUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  }

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setError("");
    try {
      setAvatarUrl(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  }

  async function onPickHeader(file: File | null) {
    if (!file) return;
    setHeaderPreview(URL.createObjectURL(file));
    setUploadingHeader(true);
    setError("");
    try {
      setHeaderUrl(await uploadFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Header upload failed");
      setHeaderPreview(null);
    } finally {
      setUploadingHeader(false);
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
          headerUrl,
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
  const showHeader = headerPreview ?? headerUrl;

  return (
    <section className="overflow-hidden rounded-[1rem] border border-line bg-paper">
      <input
        ref={headerRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickHeader(e.target.files?.[0] ?? null)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickAvatar(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => headerRef.current?.click()}
        className="group relative block w-full text-left"
        aria-label="Upload header background"
      >
        <DeckHeroHeader
          displayName={displayName || "Your name"}
          handle={handle}
          bio={bio}
          avatarUrl={showAvatar}
          headerUrl={showHeader}
        />
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 text-sm font-medium text-white opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
          <ImagePlus className="size-4" />
          {showHeader ? "Change header" : "Upload header"}
        </span>
        {uploadingHeader && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-8 animate-spin text-white" />
          </span>
        )}
      </button>

      <div className="p-5 text-center">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div>
            <h2 className="font-display text-xl leading-tight text-ink">Your profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">deckk.me/{handle}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={save}
            disabled={saving || uploading || uploadingHeader}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center gap-5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative shrink-0"
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

          <div className="w-full space-y-4">
            <FloatingField
              id="profile-name"
              label="Display name"
              placeholder="How you appear on your deck"
              value={displayName}
              onChange={setDisplayName}
              maxLength={50}
            />
            <FloatingField
              id="profile-bio"
              label="Bio"
              placeholder="A line or two about you"
              value={bio}
              onChange={setBio}
              multiline
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        {saved && (
          <p className="mt-3 text-sm text-muted-foreground">Profile saved.</p>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    </section>
  );
}
