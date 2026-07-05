"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirectToStripeIfNeeded } from "@/lib/stripe-onboarding-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProductForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inventory, setInventory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(Number.parseFloat(price) * 100);
    if (!title || !Number.isFinite(priceCents) || priceCents <= 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          title,
          description,
          priceCents,
          inventoryQty: inventory ? Number.parseInt(inventory, 10) : null,
          images: imageUrl ? [imageUrl] : [],
        }),
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setInventory("");
      setImageUrl("");
      router.refresh();
      await redirectToStripeIfNeeded("/dashboard/payments");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border p-4">
      <div>
        <Label htmlFor="product-title">Title</Label>
        <Input
          id="product-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="product-desc">Description</Label>
        <Textarea
          id="product-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="product-price">Price (USD)</Label>
          <Input
            id="product-price"
            type="number"
            min={0.01}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="product-inventory">Inventory (blank = unlimited)</Label>
          <Input
            id="product-inventory"
            type="number"
            min={0}
            value={inventory}
            onChange={(e) => setInventory(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="product-image">Image URL</Label>
        <Input
          id="product-image"
          type="url"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding…" : "Add product"}
      </Button>
    </form>
  );
}
