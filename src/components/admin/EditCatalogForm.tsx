"use client";

import { useState } from "react";
import { MotionButton } from "@/components/motion/FadeIn";

type EditCatalogFormProps = {
  catalogId: string;
  initialTitle: string;
  initialClientName?: string | null;
  initialSlug: string;
  onUpdated: (updates: {
    title: string;
    clientName: string | null;
    slug: string;
  }) => void;
};

export function EditCatalogForm({
  catalogId,
  initialTitle,
  initialClientName,
  initialSlug,
  onUpdated,
}: EditCatalogFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [clientName, setClientName] = useState(initialClientName ?? "");
  const [slug, setSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const slugChanged = slug.trim() !== initialSlug;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, clientName, slug }),
      });

      const data = (await response.json()) as {
        error?: string;
        title?: string;
        clientName?: string | null;
        slug?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to update gallery.");
        return;
      }

      const updates = {
        title: data.title ?? title.trim(),
        clientName: data.clientName ?? (clientName.trim() || null),
        slug: data.slug ?? slug.trim(),
      };

      setTitle(updates.title);
      setClientName(updates.clientName ?? "");
      setSlug(updates.slug);
      setSaved(true);
      onUpdated(updates);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-sm border border-border/60 p-6">
      <h2 className="font-display text-xl font-light">Gallery Details</h2>
      <p className="mt-2 text-sm text-muted">
        Update the title, client name, or URL slug for this gallery.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Title</span>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaved(false);
              }}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
              Client Name
            </span>
            <input
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setSaved(false);
              }}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
              placeholder="Optional"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
              URL Slug
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSaved(false);
              }}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
              required
            />
          </label>
        </div>

        {slugChanged ? (
          <p className="text-xs text-muted">
            Changing the slug will break any links you have already shared with this gallery&apos;s
            current URL.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <MotionButton
            type="submit"
            disabled={loading}
            className="bg-foreground px-5 py-2.5 text-xs tracking-[0.15em] uppercase text-background disabled:opacity-40"
          >
            {loading ? "Saving…" : "Save Details"}
          </MotionButton>
          {saved ? <p className="text-sm text-muted">Details saved.</p> : null}
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
    </section>
  );
}
