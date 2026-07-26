import Image from "next/image";
import { Reveal } from "@/components/motion/FadeIn";
import { portfolioImages, siteConfig } from "@/lib/site-config";

export function AboutSection() {
  const { about } = siteConfig;
  const image = portfolioImages.about;

  return (
    <section id="about" className="relative border-t border-border/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <Reveal className="lg:col-span-5">
          <p className="text-xs tracking-[0.35em] uppercase text-accent">
            {about.eyebrow}
          </p>
          <h2 className="mt-5 font-display text-3xl font-light leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {about.title}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted sm:text-lg">
            {about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
