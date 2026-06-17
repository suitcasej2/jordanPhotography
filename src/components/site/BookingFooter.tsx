import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function BookingFooter() {
  const { bookingHeadline, bookingMessage, phone, photographerName } = siteConfig;

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md">
          <p className="text-xs tracking-[0.35em] uppercase text-accent">
            {bookingHeadline}
          </p>
          <h2 className="font-booking mt-3 text-3xl font-light italic tracking-tight sm:text-4xl">
            Let&apos;s work together
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{bookingMessage}</p>
        </div>

        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="text-lg tracking-[0.04em] text-foreground transition hover:text-accent"
          >
            {phone}
          </a>
        ) : null}
      </div>

      <div className="border-t border-border/40 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 text-xs tracking-[0.15em] uppercase text-muted sm:flex-row sm:items-center">
          <p>{photographerName} · Documentary Photography</p>
          <Link href="/admin" className="transition hover:text-foreground">
            Studio
          </Link>
        </div>
      </div>
    </footer>
  );
}
