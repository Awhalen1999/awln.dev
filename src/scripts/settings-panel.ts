/**
 * Settings panel — wires up interactive controls inside the Site Settings
 * window. Uses event delegation so it works with dynamically injected content.
 */

const root = document.documentElement;

/* ── Read current state ─────────────────────────────────────── */

function currentTheme(): string {
  return root.getAttribute("data-theme") ?? "light";
}

function currentAccent(): string {
  return root.getAttribute("data-accent") ?? "orange";
}

function currentLinkStyle(): string {
  return localStorage.getItem("link-style") ?? "solid";
}

/* ── Sync toggle UI to state ────────────────────────────────── */

function syncGroup(group: HTMLElement, value: string) {
  for (const btn of group.querySelectorAll<HTMLElement>(".btn[data-value]")) {
    if (btn.dataset.value === value) btn.setAttribute("data-active", "");
    else btn.removeAttribute("data-active");
  }
}

function syncAll(container: HTMLElement) {
  for (const group of container.querySelectorAll<HTMLElement>(
    ".btn-group[data-setting]",
  )) {
    const setting = group.dataset.setting;
    if (setting === "theme") syncGroup(group, currentTheme());
    else if (setting === "accent") syncGroup(group, currentAccent());
    else if (setting === "link-style") syncGroup(group, currentLinkStyle());
  }
}

/* ── Apply state changes ────────────────────────────────────── */

function setTheme(value: string) {
  const dark = value === "dark";
  root.setAttribute("data-theme", dark ? "dark" : "light");
  localStorage.setItem("theme", dark ? "dark" : "light");

  // Keep menubar toggle in sync
  const btn = document.querySelector<HTMLElement>("[data-theme-toggle]");
  if (btn) {
    btn.textContent = dark ? "ON" : "OFF";
    if (dark) btn.setAttribute("data-active", "");
    else btn.removeAttribute("data-active");
  }
}

function setAccent(value: string) {
  if (value && value !== "orange") {
    root.setAttribute("data-accent", value);
  } else {
    root.removeAttribute("data-accent");
    value = "orange";
  }
  localStorage.setItem("accent-color", value);

  // Keep menubar swatches in sync
  for (const s of document.querySelectorAll<HTMLElement>(
    "[data-accent-swatch]",
  )) {
    if (s.dataset.accentSwatch === value) s.setAttribute("data-active", "");
    else s.removeAttribute("data-active");
  }
}

function setLinkStyle(value: string) {
  if (value === "dotted") {
    root.setAttribute("data-link-style", "dotted");
  } else {
    root.removeAttribute("data-link-style");
    value = "solid";
  }
  localStorage.setItem("link-style", value);
}

/* ── Event delegation for toggle clicks ─────────────────────── */

document.addEventListener("click", (e) => {
  const toggle = (e.target as HTMLElement).closest<HTMLElement>(
    ".btn[data-value]",
  );
  if (!toggle) return;

  const group = toggle.closest<HTMLElement>(".btn-group[data-setting]");
  if (!group) return;

  const setting = group.dataset.setting;
  const value = toggle.dataset.value ?? "";

  if (setting === "theme") setTheme(value);
  else if (setting === "accent") setAccent(value);
  else if (setting === "link-style") setLinkStyle(value);

  syncGroup(group, value);
});

/* ── Init toggles when a settings window appears ────────────── */

const host = document.querySelector("[data-window-host]");
if (host) {
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (
          node instanceof HTMLElement &&
          node.dataset.appId === "site-settings"
        ) {
          const body = node.querySelector<HTMLElement>(".window-body");
          if (body) syncAll(body);
        }
      }
    }
  }).observe(host, { childList: true });
}

// Stay in sync if theme/accent is changed from the menubar while
// the settings window is already open.
new MutationObserver(() => {
  const body = document.querySelector<HTMLElement>(
    '[data-app-id="site-settings"] .window-body',
  );
  if (body) syncAll(body);
}).observe(root, {
  attributes: true,
  attributeFilter: ["data-theme", "data-accent"],
});

/* ── Restore link-style on page load ────────────────────────── */

if (localStorage.getItem("link-style") === "dotted") {
  root.setAttribute("data-link-style", "dotted");
}
