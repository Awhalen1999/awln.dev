/**
 * Settings — imperative adapter over nanostores.
 *
 * Re-exports the store constants and exposes get/set helpers so existing
 * vanilla-TS call-sites (terminal, menu bar, window manager) keep working
 * without importing nanostores directly. New Preact islands should import
 * the atoms from `../stores/settings` instead.
 */

import { showToast } from "./toast";
import {
  $theme,
  $accent,
  $linkStyle,
  $wallpaper,
  ACCENTS,
  WALLPAPERS,
  type Theme,
  type Accent,
  type LinkStyle,
} from "../stores/settings";

/* ── Re-exports ────────────────────────────────────────── */

export { ACCENTS, WALLPAPERS };

/* ── Read ──────────────────────────────────────────────── */

export function currentTheme(): string {
  return $theme.get();
}

export function currentAccent(): string {
  return $accent.get();
}

export function currentLinkStyle(): string {
  return $linkStyle.get();
}

export function currentWallpaper(): string {
  return $wallpaper.get();
}

/* ── Write ─────────────────────────────────────────────── */

export function setTheme(value: string) {
  $theme.set(value === "dark" ? "dark" : "light");
  syncAllUI();
}

export function setAccent(value: string) {
  $accent.set(ACCENTS.includes(value as Accent) ? (value as Accent) : "orange");
  syncAllUI();
}

export function setLinkStyle(value: string) {
  $linkStyle.set(
    value === "dotted" || value === "none" ? (value as LinkStyle) : "solid",
  );
  syncSettingsWindow();
}

export function setWallpaper(value: string) {
  $wallpaper.set(value || "default");
  syncSettingsWindow();
}

/* ── UI sync ────────────────────────────────────────────── */

function syncAllUI() {
  const theme = $theme.get();
  const accent = $accent.get();

  for (const btn of document.querySelectorAll<HTMLElement>("[data-theme-value]")) {
    if (btn.dataset.themeValue === theme) btn.setAttribute("data-active", "");
    else btn.removeAttribute("data-active");
  }

  for (const s of document.querySelectorAll<HTMLElement>("[data-accent-swatch]")) {
    if (s.dataset.accentSwatch === accent) s.setAttribute("data-active", "");
    else s.removeAttribute("data-active");
  }

  syncSettingsWindow();
}

function syncSettingsWindow() {
  const body = document.querySelector<HTMLElement>(
    '[data-app-id="site-settings"] .window-body',
  );
  if (!body) return;

  for (const group of body.querySelectorAll<HTMLElement>(
    ".btn-group[data-setting]",
  )) {
    const setting = group.dataset.setting;
    let value = "";
    if (setting === "theme") value = $theme.get();
    else if (setting === "accent") value = $accent.get();
    else if (setting === "link-style") value = $linkStyle.get();

    for (const btn of group.querySelectorAll<HTMLElement>(".btn[data-value]")) {
      if (btn.dataset.value === value) btn.setAttribute("data-active", "");
      else btn.removeAttribute("data-active");
    }
  }

  const wp = $wallpaper.get();
  for (const thumb of body.querySelectorAll<HTMLElement>(
    ".wallpaper-thumb[data-wallpaper]",
  )) {
    if (thumb.dataset.wallpaper === wp) thumb.setAttribute("data-active", "");
    else thumb.removeAttribute("data-active");
  }
}

/* ── Settings window event delegation ────────────────────── */

document.addEventListener("click", (e) => {
  const thumb = (e.target as HTMLElement).closest<HTMLElement>(
    ".wallpaper-thumb[data-wallpaper]",
  );
  if (thumb) {
    const wp = thumb.dataset.wallpaper ?? "default";
    setWallpaper(wp);
    const label = thumb.querySelector<HTMLElement>(".wallpaper-name")?.textContent ?? wp;
    showToast(`Wallpaper: ${label}`, "success");
    return;
  }

  const toggle = (e.target as HTMLElement).closest<HTMLElement>(
    ".btn[data-value]",
  );
  if (!toggle) return;

  const group = toggle.closest<HTMLElement>(".btn-group[data-setting]");
  if (!group) return;

  const setting = group.dataset.setting;
  const value = toggle.dataset.value ?? "";

  if (setting === "theme") {
    setTheme(value);
    showToast(`Theme: ${value}`, "success");
  } else if (setting === "accent") {
    setAccent(value);
    showToast(`Accent: ${value}`, "success");
  } else if (setting === "link-style") {
    setLinkStyle(value);
    showToast(`Links: ${value}`, "success");
  }
});

/* ── Sync settings window when it first appears ──────────── */

const host = document.querySelector("[data-window-host]");
if (host) {
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (
          node instanceof HTMLElement &&
          node.dataset.appId === "site-settings"
        ) {
          syncSettingsWindow();
        }
      }
    }
  }).observe(host, { childList: true });
}
