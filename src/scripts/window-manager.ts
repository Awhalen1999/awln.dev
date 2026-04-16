/**
 * Window manager.
 *
 * Small, explicit state model: one `WindowState` per open window,
 * kept in a Map keyed by window id. A single app has at most one
 * window instance (opening an already-open app focuses it).
 *
 * Public side effects come through four operations:
 *   openApp(appId)        open or focus an app
 *   closeWindow(id)       close a window
 *   toggleMaximize(id)    fullscreen / restore
 *   focusWindow(id)       bring to front
 *
 * Windows are created by cloning `#window-template` and appending
 * to `[data-window-host]`. All inputs (icon clicks, dock clicks,
 * in-content `[data-open-app]` triggers, keyboard, hash changes,
 * viewport resize) are wired up via global delegation at the end.
 */

import type { App } from "../data/apps";

interface WindowState {
  id: string;
  appId: string;
  el: HTMLElement;
  titlebar: HTMLElement;
  body: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  maximized: boolean;
  /** Restore target — set when entering maximized state. */
  prev?: { x: number; y: number; w: number; h: number };
}

const MIN_VISIBLE = 80;        // px of title bar that must remain on-screen
const TITLEBAR_H = 28;         // clamp floor for y
const CASCADE = 24;            // px offset per cascaded window
const MOBILE_BREAKPOINT = 700;

export function initWindowManager(apps: App[]) {
  const host = document.querySelector<HTMLElement>("[data-window-host]");
  const template = document.querySelector<HTMLTemplateElement>("#window-template");
  if (!host || !template) return;

  const byId = new Map(apps.map((a) => [a.id, a]));
  const windows = new Map<string, WindowState>();
  const activeByApp = new Map<string, string>();
  let nextZ = 10;
  let focusedId: string | null = null;

  // ---- geometry -------------------------------------------------------

  const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

  function surfaceSize() {
    const surface = host!.parentElement;
    if (surface) {
      const r = surface.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }
    return { w: window.innerWidth, h: window.innerHeight };
  }

  function clampPos(w: WindowState, x: number, y: number) {
    const s = surfaceSize();
    return {
      x: Math.max(-(w.w - MIN_VISIBLE), Math.min(s.w - MIN_VISIBLE, x)),
      y: Math.max(0, Math.min(s.h - TITLEBAR_H, y)),
    };
  }

  // ---- render ---------------------------------------------------------

  function commit(w: WindowState) {
    w.el.style.left = `${w.x}px`;
    w.el.style.top = `${w.y}px`;
    w.el.style.width = `${w.w}px`;
    w.el.style.height = `${w.h}px`;
    w.el.style.zIndex = String(w.z);
    w.el.dataset.maximized = w.maximized ? "true" : "false";
  }

  function updateDockBadge(appId: string) {
    const el = document.querySelector<HTMLElement>(`[data-dock-item="${appId}"]`);
    if (!el) return;
    if (activeByApp.has(appId)) el.setAttribute("data-running", "true");
    else el.removeAttribute("data-running");
  }

  // ---- operations -----------------------------------------------------

  function focusWindow(id: string) {
    const w = windows.get(id);
    if (!w) return;
    if (focusedId === id) return;
    if (focusedId) {
      const prev = windows.get(focusedId);
      if (prev) prev.el.removeAttribute("data-focused");
    }
    w.z = ++nextZ;
    commit(w);
    w.el.setAttribute("data-focused", "");
    w.el.focus({ preventScroll: true });
    focusedId = id;
  }

  function openApp(appId: string) {
    const existing = activeByApp.get(appId);
    if (existing && windows.has(existing)) {
      focusWindow(existing);
      return;
    }

    const app = byId.get(appId);
    if (!app) return;

    const node = template!.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const titlebar = node.querySelector<HTMLElement>("[data-titlebar]");
    const body = node.querySelector<HTMLElement>("[data-body]");
    const titleSpan = node.querySelector<HTMLElement>("[data-title]");
    if (!titlebar || !body || !titleSpan) return;

    titleSpan.textContent = app.title;
    body.innerHTML = app.content;

    const s = surfaceSize();
    const mobile = isMobile();
    const ww = mobile ? s.w : Math.min(app.defaultSize.w, s.w - 40);
    const hh = mobile ? s.h : Math.min(app.defaultSize.h, s.h - 40);
    const openCount = windows.size;

    const id = `${appId}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    node.id = id;
    node.dataset.appId = appId;

    const state: WindowState = {
      id,
      appId,
      el: node,
      titlebar,
      body,
      x: mobile ? 0 : Math.max(12, Math.round((s.w - ww) / 2) + openCount * CASCADE),
      y: mobile ? 0 : Math.max(12, Math.round((s.h - hh) / 2) - 40 + openCount * CASCADE),
      w: ww,
      h: hh,
      z: ++nextZ,
      maximized: mobile,
    };

    const c = clampPos(state, state.x, state.y);
    state.x = c.x;
    state.y = c.y;

    windows.set(id, state);
    activeByApp.set(appId, id);
    host!.appendChild(node);
    commit(state);
    bindWindow(state);
    focusWindow(id);
    updateDockBadge(appId);
  }

  function closeWindow(id: string) {
    const w = windows.get(id);
    if (!w) return;
    const appId = w.appId;
    w.el.remove();
    windows.delete(id);
    if (activeByApp.get(appId) === id) activeByApp.delete(appId);
    if (focusedId === id) {
      focusedId = null;
      let top: WindowState | undefined;
      for (const other of windows.values()) {
        if (!top || other.z > top.z) top = other;
      }
      if (top) focusWindow(top.id);
    }
    updateDockBadge(appId);
  }

  function toggleMaximize(id: string) {
    const w = windows.get(id);
    if (!w) return;
    const s = surfaceSize();
    if (w.maximized) {
      if (w.prev) {
        // Clamp restored size/position in case the viewport shrank while
        // the window was maximized.
        w.w = Math.min(w.prev.w, s.w);
        w.h = Math.min(w.prev.h, s.h);
        const c = clampPos(w, w.prev.x, w.prev.y);
        w.x = c.x;
        w.y = c.y;
      }
      w.maximized = false;
    } else {
      w.prev = { x: w.x, y: w.y, w: w.w, h: w.h };
      w.x = 0;
      w.y = 0;
      w.w = s.w;
      w.h = s.h;
      w.maximized = true;
    }
    commit(w);
  }

  // ---- per-window bindings -------------------------------------------

  function bindWindow(w: WindowState) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startWinX = 0;
    let startWinY = 0;
    let pointerId = -1;

    w.titlebar.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("[data-action]")) return;
      if (e.button !== 0) return;
      if (w.maximized) return;
      dragging = true;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      startWinX = w.x;
      startWinY = w.y;
      focusWindow(w.id);
      try {
        w.titlebar.setPointerCapture(pointerId);
      } catch {
        /* already captured */
      }
      e.preventDefault();
    });

    w.titlebar.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const c = clampPos(w, startWinX + dx, startWinY + dy);
      w.x = c.x;
      w.y = c.y;
      w.el.style.left = `${w.x}px`;
      w.el.style.top = `${w.y}px`;
    });

    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      try {
        w.titlebar.releasePointerCapture(pointerId);
      } catch {
        /* already released */
      }
      pointerId = -1;
    };
    w.titlebar.addEventListener("pointerup", endDrag);
    w.titlebar.addEventListener("pointercancel", endDrag);

    w.titlebar.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).closest("[data-action]")) return;
      toggleMaximize(w.id);
    });

    w.el
      .querySelectorAll<HTMLElement>(".window-buttons [data-action]")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          switch (btn.dataset.action) {
            case "close":
              closeWindow(w.id);
              break;
            case "maximize":
              toggleMaximize(w.id);
              break;
          }
        });
      });

    // Focus on any pointer down within the window (capture phase so it
    // runs before descendant interactive elements).
    w.el.addEventListener("pointerdown", () => focusWindow(w.id), true);
  }

  // ---- global delegation ---------------------------------------------

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const inline = target.closest<HTMLElement>("[data-open-app]");
    if (inline) {
      const id = inline.dataset.openApp;
      if (id) {
        e.preventDefault();
        openApp(id);
      }
      return;
    }

    const btn = target.closest<HTMLElement>("[data-app]");
    if (btn) {
      const id = btn.dataset.app;
      if (id) openApp(id);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && focusedId) closeWindow(focusedId);
  });

  // ---- deep link (hash) ----------------------------------------------

  const openFromHash = () => {
    const hash = window.location.hash.slice(1);
    if (hash && byId.has(hash)) openApp(hash);
  };
  window.addEventListener("hashchange", openFromHash);

  // ---- viewport resize ------------------------------------------------

  window.addEventListener("resize", () => {
    const s = surfaceSize();
    const mobile = isMobile();
    for (const w of windows.values()) {
      if (mobile || w.maximized) {
        w.x = 0;
        w.y = 0;
        w.w = s.w;
        w.h = s.h;
      } else {
        const c = clampPos(w, w.x, w.y);
        w.x = c.x;
        w.y = c.y;
      }
      commit(w);
    }
  });

  // ---- boot -----------------------------------------------------------

  if (window.location.hash) openFromHash();
}
