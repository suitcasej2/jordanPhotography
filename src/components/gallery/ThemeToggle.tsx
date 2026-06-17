"use client";

import { useGalleryPreferences } from "@/components/gallery/GalleryPreferences";
import { MoonIcon, SunIcon } from "@/components/gallery/GalleryIcons";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useGalleryPreferences();

  return (
    <div className={className}>
      <span className="sr-only">Theme</span>
      <div className="flex rounded-sm border border-border/60 p-0.5">
        <button
          type="button"
          aria-pressed={theme === "light"}
          aria-label="Light mode"
          onClick={() => setTheme("light")}
          className={`flex h-9 w-9 items-center justify-center transition ${
            theme === "light"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <SunIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-pressed={theme === "dark"}
          aria-label="Dark mode"
          onClick={() => setTheme("dark")}
          className={`flex h-9 w-9 items-center justify-center transition ${
            theme === "dark"
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <MoonIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
