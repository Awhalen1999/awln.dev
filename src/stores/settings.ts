/**
 * Settings stores — reactive atoms for all site preferences.
 *
 * These are the single source of truth consumed by both vanilla TS scripts
 * (via .subscribe / .get / .set) and Preact islands (via useStore).
 * Persistence to localStorage and DOM attribute sync happen here so
 * consumers never need to touch localStorage directly.
 */

import { atom } from "nanostores";

/* ── Types ─────────────────────────────────────────────── */

export type Theme = "light" | "dark";
export type Accent = "orange" | "green" | "blue" | "purple";
export type LinkStyle = "solid" | "dotted" | "none";

/* ── Constants ─────────────────────────────────────────── */

export const ACCENTS: readonly string[] = ["orange", "green", "blue", "purple"];

export const WALLPAPERS: { key: string; id: string; name: string }[] = [
  { key: "default", id: "default", name: "Default" },
  { key: "2", id: "wallpaper2", name: "Flying Kitty (macOS)" },
  { key: "3", id: "wallpaper3", name: "Circuit Board (macOS)" },
  { key: "4", id: "wallpaper4", name: "Bliss (Windows XP)" },
  { key: "5", id: "wallpaper5", name: "Hello Light" },
  { key: "6", id: "wallpaper6", name: "Hello Dark" },
];

/* ── Helpers ───────────────────────────────────────────── */

function readTheme(): Theme {
  return (localStorage.getItem("theme") ?? "light") === "dark" ? "dark" : "light";
}
function readAccent(): Accent {
  const v = localStorage.getItem("accent-color") ?? "orange";
  return ACCENTS.includes(v as Accent) ? (v as Accent) : "orange";
}
function readLinkStyle(): LinkStyle {
  const v = localStorage.getItem("link-style") ?? "solid";
  return v === "dotted" || v === "none" ? v : "solid";
}
function readWallpaper(): string {
  return localStorage.getItem("wallpaper") ?? "default";
}

/* ── Atoms ─────────────────────────────────────────────── */

export const $theme = atom<Theme>(readTheme());
export const $accent = atom<Accent>(readAccent());
export const $linkStyle = atom<LinkStyle>(readLinkStyle());
export const $wallpaper = atom<string>(readWallpaper());

/* ── Side-effects: persist + sync DOM on every change ──── */

const root = document.documentElement;

$theme.subscribe((value) => {
  root.setAttribute("data-theme", value);
  localStorage.setItem("theme", value);
});

$accent.subscribe((value) => {
  if (value !== "orange") root.setAttribute("data-accent", value);
  else root.removeAttribute("data-accent");
  localStorage.setItem("accent-color", value);
});

$linkStyle.subscribe((value) => {
  if (value === "dotted" || value === "none") root.setAttribute("data-link-style", value);
  else root.removeAttribute("data-link-style");
  localStorage.setItem("link-style", value);
});

$wallpaper.subscribe((value) => {
  const desktop = document.querySelector<HTMLElement>("[data-desktop]");
  if (!desktop) return;
  if (value && value !== "default") {
    desktop.style.backgroundImage = `url(/wallpapers/${value}.png)`;
    desktop.setAttribute("data-wallpaper", value);
  } else {
    desktop.style.backgroundImage = "";
    desktop.removeAttribute("data-wallpaper");
  }
  localStorage.setItem("wallpaper", value || "default");
});
