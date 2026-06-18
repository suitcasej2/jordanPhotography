"use client";

import { useState } from "react";
import { MotionButton } from "@/components/motion/FadeIn";

function generateGalleryPassword() {
  const words = ["light", "frame", "gallery", "moment", "focus", "studio", "lens"];
  const word = words[Math.floor(Math.random() * words.length)];
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${word}-${digits}`;
}

export function GalleryPasswordSettings({ catalogId }: { catalogId: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSavedPassword(null);
    setCopied(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/catalogs/${catalogId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Failed to update password.");
        return;
      }

      setSavedPassword(password);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!savedPassword) return;
    await navigator.clipboard.writeText(savedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-sm border border-border/60 p-6">
      <h2 className="font-display text-xl font-light">Gallery Password</h2>
      <p className="mt-2 text-sm text-muted">
        Clients need this password to view the gallery. Passwords are stored securely
        and cannot be viewed after saving.
      </p>

      {savedPassword ? (
        <div className="mt-4 rounded-sm border border-accent/30 bg-accent/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-muted">New password</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="font-mono text-sm">{savedPassword}</code>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="text-xs tracking-[0.15em] uppercase text-accent transition hover:text-foreground"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Share this with your client now. You will not be able to see it again.
          </p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
              New Password
            </span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
              placeholder="Enter a new password"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
              Confirm Password
            </span>
            <input
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border-b border-border bg-transparent py-2 outline-none focus:border-accent"
              placeholder="Repeat the password"
              autoComplete="new-password"
              required
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <MotionButton
            type="submit"
            disabled={loading}
            className="bg-foreground px-5 py-2.5 text-xs tracking-[0.15em] uppercase text-background disabled:opacity-40"
          >
            {loading ? "Saving…" : "Update Password"}
          </MotionButton>
          <button
            type="button"
            onClick={() => {
              const generated = generateGalleryPassword();
              setPassword(generated);
              setConfirmPassword(generated);
              setSavedPassword(null);
              setError("");
            }}
            className="text-xs tracking-[0.15em] uppercase text-muted transition hover:text-accent"
          >
            Generate Password
          </button>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
    </section>
  );
}
