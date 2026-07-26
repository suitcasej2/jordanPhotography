"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/FadeIn";
import { portfolioImages, siteConfig } from "@/lib/site-config";

export function WorkSection() {
  const { work } = siteConfig;

  return (
    <section id="work" className="relative border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <p className="text-xs tracking-[0.35em] uppercase text-accent">
            {work.eyebrow}
          </p>
          <h2 className="mt-5 font-display text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl">
            {work.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {work.subtitle}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12 lg:gap-5">
          {portfolioImages.work.map((photo, index) => {
            const wide = photo.span === "wide";
            return (
              <Reveal
                key={photo.src}
                delay={Math.min(index * 0.04, 0.24)}
                className={
                  wide
                    ? "sm:col-span-2 lg:col-span-8"
                    : "lg:col-span-4"
                }
              >
                <motion.figure
                  className="group relative aspect-[3/2] overflow-hidden bg-surface"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={
                      wide
                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    }
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </motion.figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
