export type GalleryViewMode = "grid" | "slideshow";
export type GalleryTheme = "dark" | "light";

const VIEW_KEY = "gallery-view";
const THEME_KEY = "gallery-theme";

export function loadGalleryView(): GalleryViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = localStorage.getItem(VIEW_KEY);
  return stored === "slideshow" ? "slideshow" : "grid";
}

export function saveGalleryView(mode: GalleryViewMode) {
  localStorage.setItem(VIEW_KEY, mode);
}

export function loadGalleryTheme(): GalleryTheme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
}

export function saveGalleryTheme(theme: GalleryTheme) {
  localStorage.setItem(THEME_KEY, theme);
}
