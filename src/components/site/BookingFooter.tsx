import { siteConfig } from "@/lib/site-config";

export function BookingFooter() {
  const { bookingHeadline, bookingMessage, phone, instagram, photographerName } =
    siteConfig;

  return (
    <footer id="booking" className="border-t border-border/60 bg-background">
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

        <div className="flex flex-col gap-3 sm:items-end">
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-lg tracking-[0.04em] text-foreground transition hover:text-accent"
          >
            {phone}
          </a>
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm tracking-[0.08em] text-muted transition hover:text-accent"
          >
            {instagram.handle}
          </a>
        </div>
      </div>

      <div className="border-t border-border/40 px-6 py-5">
        <div className="mx-auto max-w-7xl text-xs tracking-[0.15em] uppercase text-muted">
          <p>{photographerName} · Documentary Photography</p>
        </div>
      </div>
    </footer>
  );
}
