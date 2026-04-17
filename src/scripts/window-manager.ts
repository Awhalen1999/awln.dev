import type { App } from "../data/apps";

interface WindowState {
  id: string;
  appId: string;
  el: HTMLElement;
  titlebar: HTMLElement;
  body: HTMLElement;
  titleEl: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  maximized: boolean;
  prev?: { x: number; y: number; w: number; h: number };
}

type WindowAction = "close" | "maximize";

const CASCADE = 24;
const MOBILE_Q = "(max-width: 699px)";

// Single source of truth for the "usable region" inside desktop-surface.
// Every window — whether dragged, resized, maximized, or freshly opened —
// stays within these insets.
const APP_PADDING = { left: 12, right: 12, top: 12, bottom: 12 };

// Matches min-width/min-height on .window in global.css.
const MIN_W = 320;
const MIN_H = 220;

export function initWindowManager(apps: App[]) {
  const host = document.querySelector<HTMLElement>("[data-window-host]");
  const template = document.querySelector<HTMLTemplateElement>("#window-template");
  if (!host || !template) return;

  const probe = template.content.firstElementChild;
  if (
    !probe ||
    !probe.querySelector("[data-titlebar]") ||
    !probe.querySelector("[data-body]") ||
    !probe.querySelector("[data-title]")
  ) {
    console.error("[window-manager] window template is missing required slots");
    return;
  }

  const byId = new Map(apps.map((a) => [a.id, a]));
  const windows = new Map<string, WindowState>();
  const activeByApp = new Map<string, string>();
  const dockItems = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>("[data-dock-item]").forEach((el) => {
    const id = el.dataset.dockItem;
    if (id) dockItems.set(id, el);
  });

  const mobileMedia = window.matchMedia(MOBILE_Q);
  let nextZ = 10;
  let focusedId: string | null = null;
  let resizeScheduled = false;

  const isMobile = () => mobileMedia.matches;

  function surfaceMetrics() {
    const surface = host!.parentElement;
    if (!surface) return { w: window.innerWidth, h: window.innerHeight };
    const r = surface.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function clampPos(w: WindowState, x: number, y: number) {
    const m = surfaceMetrics();
    const xMax = Math.max(APP_PADDING.left, m.w - APP_PADDING.right - w.w);
    const yMax = Math.max(APP_PADDING.top, m.h - APP_PADDING.bottom - w.h);
    return {
      x: Math.max(APP_PADDING.left, Math.min(xMax, x)),
      y: Math.max(APP_PADDING.top, Math.min(yMax, y)),
    };
  }

  function clampSize(w: WindowState, newW: number, newH: number) {
    const m = surfaceMetrics();
    const wMax = m.w - APP_PADDING.right - w.x;
    const hMax = m.h - APP_PADDING.bottom - w.y;
    return {
      w: Math.max(MIN_W, Math.min(wMax, newW)),
      h: Math.max(MIN_H, Math.min(hMax, newH)),
    };
  }

  function applyGeometry(w: WindowState) {
    w.el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;
    w.el.style.width = `${w.w}px`;
    w.el.style.height = `${w.h}px`;
    w.el.style.zIndex = String(w.z);
    w.el.dataset.maximized = w.maximized ? "true" : "false";
  }

  // Hot path during drag — only the transform changes; size/z stay put.
  function applyTransform(w: WindowState) {
    w.el.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;
  }

  function fillSurface(w: WindowState) {
    const s = surfaceMetrics();
    w.x = APP_PADDING.left;
    w.y = APP_PADDING.top;
    w.w = s.w - APP_PADDING.left - APP_PADDING.right;
    w.h = s.h - APP_PADDING.top - APP_PADDING.bottom;
  }

  function updateDockBadge(appId: string) {
    const el = dockItems.get(appId);
    if (!el) return;
    if (activeByApp.has(appId)) el.setAttribute("data-running", "true");
    else el.removeAttribute("data-running");
  }

  function focusWindow(id: string) {
    const w = windows.get(id);
    if (!w || focusedId === id) return;
    if (focusedId) {
      const prev = windows.get(focusedId);
      if (prev) prev.el.removeAttribute("data-focused");
    }
    w.z = ++nextZ;
    applyGeometry(w);
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
    const titlebar = node.querySelector<HTMLElement>("[data-titlebar]")!;
    const body = node.querySelector<HTMLElement>("[data-body]")!;
    const titleEl = node.querySelector<HTMLElement>("[data-title]")!;

    const id = crypto.randomUUID();
    const titleId = `win-title-${id}`;
    titleEl.id = titleId;
    titleEl.textContent = app.title;
    body.innerHTML = app.content;
    node.id = id;
    node.dataset.appId = appId;
    node.setAttribute("aria-labelledby", titleId);

    const s = surfaceMetrics();
    const mobile = isMobile();
    const usableW = s.w - APP_PADDING.left - APP_PADDING.right;
    const usableH = s.h - APP_PADDING.top - APP_PADDING.bottom;
    const ww = Math.max(MIN_W, Math.min(app.defaultSize.w, usableW));
    const hh = Math.max(MIN_H, Math.min(app.defaultSize.h, usableH));
    const openCount = windows.size;

    const state: WindowState = {
      id,
      appId,
      el: node,
      titlebar,
      body,
      titleEl,
      x: mobile
        ? APP_PADDING.left
        : Math.round((s.w - ww) / 2) + openCount * CASCADE,
      y: mobile
        ? APP_PADDING.top
        : Math.round((s.h - hh) / 2) - 40 + openCount * CASCADE,
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
    applyGeometry(state);
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
    if (w.maximized) {
      if (w.prev) {
        const s = surfaceMetrics();
        const usableW = s.w - APP_PADDING.left - APP_PADDING.right;
        const usableH = s.h - APP_PADDING.top - APP_PADDING.bottom;
        w.w = Math.max(MIN_W, Math.min(w.prev.w, usableW));
        w.h = Math.max(MIN_H, Math.min(w.prev.h, usableH));
        const c = clampPos(w, w.prev.x, w.prev.y);
        w.x = c.x;
        w.y = c.y;
      }
      w.maximized = false;
    } else {
      w.prev = { x: w.x, y: w.y, w: w.w, h: w.h };
      fillSurface(w);
      w.maximized = true;
    }
    applyGeometry(w);
  }

  const ACTIONS: Record<WindowAction, (id: string) => void> = {
    close: closeWindow,
    maximize: toggleMaximize,
  };

  function bindWindow(w: WindowState) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startWinX = 0;
    let startWinY = 0;
    let pointerId = -1;

    w.titlebar.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("[data-action]")) return;
      if (e.button !== 0 || w.maximized) return;
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
        /* pointer already captured */
      }
      e.preventDefault();
    });

    w.titlebar.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const c = clampPos(
        w,
        startWinX + (e.clientX - startX),
        startWinY + (e.clientY - startY),
      );
      w.x = c.x;
      w.y = c.y;
      applyTransform(w);
    });

    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      try {
        w.titlebar.releasePointerCapture(pointerId);
      } catch {
        /* pointer already released */
      }
      pointerId = -1;
    };
    w.titlebar.addEventListener("pointerup", endDrag);
    w.titlebar.addEventListener("pointercancel", endDrag);

    w.titlebar.addEventListener("dblclick", (e) => {
      if ((e.target as HTMLElement).closest("[data-action]")) return;
      toggleMaximize(w.id);
    });

    w.el.querySelectorAll<HTMLElement>(".window-buttons [data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action as WindowAction | undefined;
        if (action && action in ACTIONS) ACTIONS[action](w.id);
      });
    });

    const resizeHandle = w.el.querySelector<HTMLElement>("[data-resize]");
    if (resizeHandle) {
      let resizing = false;
      let rStartX = 0;
      let rStartY = 0;
      let rStartW = 0;
      let rStartH = 0;
      let rPointerId = -1;

      resizeHandle.addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || w.maximized) return;
        resizing = true;
        rPointerId = e.pointerId;
        rStartX = e.clientX;
        rStartY = e.clientY;
        rStartW = w.w;
        rStartH = w.h;
        focusWindow(w.id);
        try {
          resizeHandle.setPointerCapture(rPointerId);
        } catch {
          /* pointer already captured */
        }
        e.preventDefault();
        e.stopPropagation();
      });

      resizeHandle.addEventListener("pointermove", (e) => {
        if (!resizing || e.pointerId !== rPointerId) return;
        const size = clampSize(
          w,
          rStartW + (e.clientX - rStartX),
          rStartH + (e.clientY - rStartY),
        );
        w.w = size.w;
        w.h = size.h;
        w.el.style.width = `${w.w}px`;
        w.el.style.height = `${w.h}px`;
      });

      const endResize = (e: PointerEvent) => {
        if (!resizing || e.pointerId !== rPointerId) return;
        resizing = false;
        try {
          resizeHandle.releasePointerCapture(rPointerId);
        } catch {
          /* pointer already released */
        }
        rPointerId = -1;
      };
      resizeHandle.addEventListener("pointerup", endResize);
      resizeHandle.addEventListener("pointercancel", endResize);
    }

    // Capture phase so focus flips before descendant click handlers run.
    w.el.addEventListener("pointerdown", () => focusWindow(w.id), true);
  }

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const inline = target.closest<HTMLElement>("[data-open-app]");
    if (inline?.dataset.openApp) {
      e.preventDefault();
      openApp(inline.dataset.openApp);
      return;
    }

    const btn = target.closest<HTMLElement>("[data-app]");
    if (btn?.dataset.app) openApp(btn.dataset.app);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !focusedId) return;
    // Don't hijack Escape from inputs, details, or editable content inside a window.
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable='true'], details[open]")) return;
    closeWindow(focusedId);
  });

  const openFromHash = () => {
    const hash = window.location.hash.slice(1);
    if (hash && byId.has(hash)) openApp(hash);
  };
  window.addEventListener("hashchange", openFromHash);

  function reflow() {
    const mobile = isMobile();
    for (const w of windows.values()) {
      if (mobile || w.maximized) {
        fillSurface(w);
      } else {
        // Size first so the subsequent position clamp uses the new size.
        const size = clampSize(w, w.w, w.h);
        w.w = size.w;
        w.h = size.h;
        const c = clampPos(w, w.x, w.y);
        w.x = c.x;
        w.y = c.y;
      }
      applyGeometry(w);
    }
  }

  window.addEventListener("resize", () => {
    if (resizeScheduled) return;
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      reflow();
    });
  });

  if (window.location.hash) openFromHash();
}
