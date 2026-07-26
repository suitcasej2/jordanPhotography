"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion/FadeIn";
import { portfolioImages, siteConfig } from "@/lib/site-config";

export function HeroSection() {
  const { photographerName, tagline, headline, supportingLine } = siteConfig;
  const hero = portfolioImages.hero;

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28 sm:pb-24">
        <FadeIn>
          <p className="mb-5 font-display text-5xl font-light tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            {photographerName}
          </p>
          <p className="mb-6 text-xs tracking-[0.4em] uppercase text-accent">
            {tagline}
          </p>
          <h1 className="max-w-2xl font-display text-2xl font-light leading-snug tracking-tight text-foreground/95 sm:text-3xl lg:text-4xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            {supportingLine}
          </p>
        </FadeIn>

        <FadeIn delay={0.18} className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href="#work"
            className="inline-flex items-center border border-foreground/80 px-7 py-3 text-xs tracking-[0.28em] uppercase text-foreground transition hover:border-accent hover:text-accent"
          >
            View work
          </a>
          <a
            href="#booking"
            className="text-xs tracking-[0.28em] uppercase text-muted transition hover:text-foreground"
          >
            Get in touch
          </a>
        </FadeIn>
      </div>
    </section>
  );
}
