"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MotionButton } from "@/components/motion/FadeIn";

export function CreateCatalogForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, clientName, password, slug }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Failed to create catalog.");
        return;
      }

      setTitle("");
      setClientName("");
      setPassword("");
      setSlug("");
      onCreated();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-sm border border-border/60 p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="font-display text-xl font-light">New Gallery</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
            placeholder="Indigo Workshop"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Client Name</span>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
            placeholder="Optional"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Custom URL Slug</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
            placeholder="auto-generated"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">Gallery Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
            placeholder="Share this with your client"
            required
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <MotionButton
        type="submit"
        disabled={loading}
        className="bg-foreground px-5 py-2.5 text-xs tracking-[0.15em] uppercase text-background disabled:opacity-40"
      >
        {loading ? "Creating…" : "Create Gallery"}
      </MotionButton>
    </motion.form>
  );
}
