"use client";

import { useState } from "react";
import { FadeIn, MotionButton } from "@/components/motion/FadeIn";
import type { AdminLoadResult } from "@/components/admin/AdminDashboard";

export function AdminLogin({
  onSuccess,
}: {
  onSuccess: () => Promise<AdminLoadResult>;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Invalid password.");
        return;
      }

      const result = await onSuccess();
      if (!result.ok) {
        setError(result.error);
      }
    } catch {
      setError("Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <FadeIn className="w-full max-w-sm">
        <p className="mb-2 text-xs tracking-[0.35em] uppercase text-muted">Studio</p>
        <h1 className="font-display text-3xl font-light">Admin Access</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full border-b border-border bg-transparent py-3 outline-none focus:border-accent"
            autoFocus
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <MotionButton
            type="submit"
            disabled={loading}
            className="w-full bg-foreground py-3 text-sm tracking-[0.15em] uppercase text-background disabled:opacity-40"
          >
            {loading ? "Signing in…" : "Enter"}
          </MotionButton>
        </form>
      </FadeIn>
    </div>
  );
}
