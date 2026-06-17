"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn, MotionButton } from "@/components/motion/FadeIn";
import { ThemeToggle } from "@/components/gallery/ThemeToggle";
import { BookingFooter } from "@/components/site/BookingFooter";

type CatalogPreview = {
  title: string;
  clientName?: string | null;
  photoCount: number;
  daysRemaining: number;
};

export function PasswordGate({
  slug,
  catalog,
  onAuthenticated,
}: {
  slug: string;
  catalog: CatalogPreview;
  onAuthenticated: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/catalogs/${slug}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      onAuthenticated();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[70vh] px-6 py-12">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="flex min-h-[70vh] items-center justify-center">
      <FadeIn className="w-full max-w-md text-center">
        <p className="mb-3 text-xs tracking-[0.35em] uppercase text-muted">
          Private Gallery
        </p>
        <h1 className="font-display text-4xl font-light tracking-tight text-foreground sm:text-5xl">
          {catalog.title}
        </h1>
        {catalog.clientName ? (
          <p className="mt-3 text-muted">Prepared for {catalog.clientName}</p>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted">
          <span>{catalog.photoCount} photos</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>{catalog.daysRemaining} days left</span>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-4 text-left">
          <label className="block">
            <span className="mb-2 block text-xs tracking-[0.2em] uppercase text-muted">
              Gallery Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent px-1 py-3 text-lg outline-none transition-colors focus:border-accent"
              placeholder="Enter password"
              autoFocus
              required
            />
          </label>

          <AnimatePresence>
            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-red-400"
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <MotionButton
            type="submit"
            disabled={loading || !password}
            className="mt-6 w-full bg-foreground px-6 py-3.5 text-sm tracking-[0.15em] uppercase text-background transition-opacity disabled:opacity-40"
          >
            {loading ? "Opening…" : "View Gallery"}
          </MotionButton>
        </form>
      </FadeIn>
      </div>

      <BookingFooter />
    </div>
  );
}
