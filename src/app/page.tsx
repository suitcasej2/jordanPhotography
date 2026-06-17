import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { BookingFooter } from "@/components/site/BookingFooter";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,165,116,0.08),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <p className="text-xs tracking-[0.35em] uppercase text-muted">Jordan</p>
          <Link
            href="/admin"
            className="text-xs tracking-[0.2em] uppercase text-muted transition hover:text-foreground"
          >
            Studio
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20">
          <FadeIn>
            <p className="mb-4 text-xs tracking-[0.4em] uppercase text-accent">
              Documentary Photography
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[1.05] font-light tracking-tight sm:text-7xl">
              Your moments, delivered with care.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Private galleries for clients to view and download their photos.
              Password protected. Available for 30 days.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-12 flex flex-wrap gap-4">
            <div className="border border-border/80 px-6 py-4 text-sm text-muted">
              <span className="block text-xs tracking-[0.2em] uppercase">Access</span>
              <span className="mt-1 block text-foreground">Password protected galleries</span>
            </div>
            <div className="border border-border/80 px-6 py-4 text-sm text-muted">
              <span className="block text-xs tracking-[0.2em] uppercase">Delivery</span>
              <span className="mt-1 block text-foreground">Full-resolution downloads</span>
            </div>
            <div className="border border-border/80 px-6 py-4 text-sm text-muted">
              <span className="block text-xs tracking-[0.2em] uppercase">Availability</span>
              <span className="mt-1 block text-foreground">30-day gallery window</span>
            </div>
          </FadeIn>
        </section>
      </div>

      <BookingFooter />
    </main>
  );
}
