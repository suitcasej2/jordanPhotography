"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  loadGalleryTheme,
  loadGalleryView,
  saveGalleryTheme,
  saveGalleryView,
  type GalleryTheme,
  type GalleryViewMode,
} from "@/lib/gallery-preferences";

type GalleryPreferencesContextValue = {
  viewMode: GalleryViewMode;
  theme: GalleryTheme;
  setViewMode: (mode: GalleryViewMode) => void;
  setTheme: (theme: GalleryTheme) => void;
};

const GalleryPreferencesContext =
  createContext<GalleryPreferencesContextValue | null>(null);

export function GalleryPreferencesProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<GalleryViewMode>("grid");
  const [theme, setThemeState] = useState<GalleryTheme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setViewModeState(loadGalleryView());
    setThemeState(loadGalleryTheme());
    setReady(true);
  }, []);

  function setViewMode(mode: GalleryViewMode) {
    setViewModeState(mode);
    saveGalleryView(mode);
  }

  function setTheme(nextTheme: GalleryTheme) {
    setThemeState(nextTheme);
    saveGalleryTheme(nextTheme);
  }

  return (
    <GalleryPreferencesContext.Provider
      value={{ viewMode, theme, setViewMode, setTheme }}
    >
      <div
        data-theme={ready ? theme : "dark"}
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground transition-colors duration-300"
      >
        {children}
      </div>
    </GalleryPreferencesContext.Provider>
  );
}

export function useGalleryPreferences() {
  const context = useContext(GalleryPreferencesContext);
  if (!context) {
    throw new Error("useGalleryPreferences must be used within GalleryPreferencesProvider");
  }
  return context;
}
