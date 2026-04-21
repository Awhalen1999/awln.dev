/**
 * Settings — single source of truth for all site preferences.
 * Handles persistence (localStorage), DOM state, and UI sync
 * across both the menu bar and the settings window.
 */

import { showToast } from "./toast";

const root = document.documentElement;

/* ── Read ──────────────────────────────────────────────── */

export function currentTheme(): string {
  return root.getAttribute("data-theme") ?? "light";
}

export function currentAccent(): string {
  return root.getAttribute("data-accent") ?? "orange";
}

export function currentLinkStyle(): string {
  return localStorage.getItem("link-style") ?? "solid";
}

export function currentWallpaper(): string {
  return localStorage.getItem("wallpaper") ?? "default";
}

/* ── Write ─────────────────────────────────────────────── */

export function setTheme(value: string) {
  const resolved = value === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", resolved);
  localStorage.setItem("theme", resolved);
  syncAllUI();
}

export function setAccent(value: string) {
  if (value && value !== "orange") {
    root.setAttribute("data-accent", value);
  } else {
    root.removeAttribute("data-accent");
    value = "orange";
  }
  localStorage.setItem("accent-color", value);
  syncAllUI();
}

export function setLinkStyle(value: string) {
  if (value === "dotted" || value === "none") {
    root.setAttribute("data-link-style", value);
  } else {
    root.removeAttribute("data-link-style");
    value = "solid";
  }
  localStorage.setItem("link-style", value);
  syncSettingsWindow();
}

export function setWallpaper(value: string) {
  const desktop = document.querySelector<HTMLElement>("[data-desktop]");
  if (!desktop) return;
  if (value && value !== "default") {
    desktop.style.backgroundImage = `url(/wallpapers/${value}.png)`;
    desktop.setAttribute("data-wallpaper", value);
  } else {
    desktop.style.backgroundImage = "";
    desktop.removeAttribute("data-wallpaper");
    value = "default";
  }
  localStorage.setItem("wallpaper", value);
  syncSettingsWindow();
}

/* ── UI sync ────────────────────────────────────────────── */

function syncAllUI() {
  const theme = currentTheme();
  const accent = currentAccent();

  // Menu bar theme buttons
  for (const btn of document.querySelectorAll<HTMLElement>("[data-theme-value]")) {
    if (btn.dataset.themeValue === theme) btn.setAttribute("data-active", "");
    else btn.removeAttribute("data-active");
  }

  // Menu bar accent swatches
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
    if (setting === "theme") value = currentTheme();
    else if (setting === "accent") value = currentAccent();
    else if (setting === "link-style") value = currentLinkStyle();

    for (const btn of group.querySelectorAll<HTMLElement>(".btn[data-value]")) {
      if (btn.dataset.value === value) btn.setAttribute("data-active", "");
      else btn.removeAttribute("data-active");
    }
  }

  const wp = currentWallpaper();
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

/* ── Restore wallpaper on page load ──────────────────────── */

const savedWp = localStorage.getItem("wallpaper");
if (savedWp && savedWp !== "default") setWallpaper(savedWp);
