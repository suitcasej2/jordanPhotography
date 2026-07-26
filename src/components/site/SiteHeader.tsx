"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      const sections = navItems.map((item) => item.href.slice(1));
      let current = "#home";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= window.innerHeight * 0.35) {
          current = `#${id}`;
        }
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a
          href="#home"
          className="text-sm tracking-[0.35em] uppercase text-foreground transition hover:text-accent"
        >
          {siteConfig.photographerName}
        </a>

        <nav className="flex items-center gap-6 sm:gap-8" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-xs tracking-[0.22em] uppercase transition ${
                active === item.href
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
