"use client";

import { useGalleryPreferences } from "@/components/gallery/GalleryPreferences";
import { GridIcon, SlideshowIcon } from "@/components/gallery/GalleryIcons";
import type { GalleryViewMode } from "@/lib/gallery-preferences";

export function ViewModeToggle({ className }: { className?: string }) {
  const { viewMode, setViewMode } = useGalleryPreferences();

  const options: Array<{ value: GalleryViewMode; label: string; icon: typeof GridIcon }> = [
    { value: "grid", label: "Grid view", icon: GridIcon },
    { value: "slideshow", label: "Slideshow view", icon: SlideshowIcon },
  ];

  return (
    <div className={className}>
      <span className="sr-only">View mode</span>
      <div className="flex rounded-sm border border-border/60 p-0.5">
        {options.map((option) => {
          const active = viewMode === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              aria-label={option.label}
              onClick={() => setViewMode(option.value)}
              className={`flex h-9 w-9 items-center justify-center transition ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
