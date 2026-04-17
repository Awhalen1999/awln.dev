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

const MIN_VISIBLE = 160;
const TITLEBAR_H = 28;
const TOP_GAP = 2;
const CASCADE = 24;
const MOBILE_Q = "(max-width: 699px)";

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

  // Metrics for the window-host surface. `dragYMax` extends past the
  // surface bottom (where the dock sits) up to the viewport bottom, so
  // dragged windows can overlap the dock instead of being clipped.
  function surfaceMetrics() {
    const surface = host!.parentElement;
    if (!surface) {
      return {
        w: window.innerWidth,
        h: window.innerHeight,
        dragYMax: window.innerHeight - TITLEBAR_H,
      };
    }
    const r = surface.getBoundingClientRect();
    return {
      w: r.width,
      h: r.height,
      dragYMax: window.innerHeight - r.top - TITLEBAR_H,
    };
  }

  function clampPos(w: WindowState, x: number, y: number) {
    const m = surfaceMetrics();
    return {
      x: Math.max(-(w.w - MIN_VISIBLE), Math.min(m.w - MIN_VISIBLE, x)),
      y: Math.max(TOP_GAP, Math.min(m.dragYMax, y)),
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
    w.x = 0;
    w.y = 0;
    w.w = s.w;
    w.h = s.h;
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
    const ww = mobile ? s.w : Math.min(app.defaultSize.w, s.w - 40);
    const hh = mobile ? s.h : Math.min(app.defaultSize.h, s.h - 40);
    const openCount = windows.size;

    const state: WindowState = {
      id,
      appId,
      el: node,
      titlebar,
      body,
      titleEl,
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
        w.w = Math.min(w.prev.w, s.w);
        w.h = Math.min(w.prev.h, s.h);
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
    const s = surfaceMetrics();
    const mobile = isMobile();
    for (const w of windows.values()) {
      if (mobile || w.maximized) {
        fillSurface(w);
      } else {
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
