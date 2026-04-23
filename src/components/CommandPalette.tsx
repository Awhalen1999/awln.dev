import { useState, useEffect, useRef, useMemo, useCallback } from "preact/hooks";
import { APPS } from "../data/apps";
import {
  setTheme,
  setAccent,
  setWallpaper,
  WALLPAPERS,
} from "../scripts/settings";
import { showToast } from "../scripts/toast";

/* ── Types ──────────────────────────────────────────────── */

interface Action {
  id: string;
  label: string;
  group: string;
  keywords: string[];
  shortcut?: string;
  enabled?: () => boolean;
  execute: () => void;
}

/* ── Actions ────────────────────────────────────────────── */

const GROUP_ORDER = ["Navigation", "Window", "Theme", "Utility"];

function buildActions(): Action[] {
  const actions: Action[] = [];
  const hasFocused = () => !!document.querySelector("[data-focused]");

  // Navigation
  for (const app of APPS.filter((a) => a.id !== "passwords")) {
    actions.push({
      id: `open-${app.id}`,
      label: `Open ${app.title}`,
      group: "Navigation",
      keywords: [app.id, app.title.toLowerCase()],
      execute: () =>
        document.dispatchEvent(new CustomEvent("wm:open-app", { detail: app.id })),
    });
  }

  // Window
  actions.push({
    id: "maximize",
    label: "Maximize Window",
    group: "Window",
    keywords: ["maximize", "fullscreen", "restore"],
    shortcut: "⌘⌥F",
    enabled: hasFocused,
    execute: () => document.dispatchEvent(new CustomEvent("wm:maximize-focused")),
  });
  actions.push({
    id: "center",
    label: "Center Window",
    group: "Window",
    keywords: ["center", "middle"],
    shortcut: "⌘⌥C",
    enabled: hasFocused,
    execute: () => document.dispatchEvent(new CustomEvent("wm:center-focused")),
  });
  actions.push({
    id: "close",
    label: "Close Window",
    group: "Window",
    keywords: ["close", "dismiss"],
    shortcut: "⌘⌥W",
    enabled: hasFocused,
    execute: () => document.dispatchEvent(new CustomEvent("wm:close-focused")),
  });

  // Theme
  actions.push({
    id: "theme-light",
    label: "Switch to Light Mode",
    group: "Theme",
    keywords: ["light", "theme", "mode"],
    execute: () => {
      setTheme("light");
      showToast("Theme: light", "success");
    },
  });
  actions.push({
    id: "theme-dark",
    label: "Switch to Dark Mode",
    group: "Theme",
    keywords: ["dark", "theme", "mode"],
    execute: () => {
      setTheme("dark");
      showToast("Theme: dark", "success");
    },
  });

  for (const color of ["orange", "green", "blue", "purple"] as const) {
    actions.push({
      id: `accent-${color}`,
      label: `Accent: ${color[0].toUpperCase() + color.slice(1)}`,
      group: "Theme",
      keywords: ["accent", "color", color],
      execute: () => {
        setAccent(color);
        showToast(`Accent: ${color}`, "success");
      },
    });
  }

  for (const wp of WALLPAPERS) {
    actions.push({
      id: `wallpaper-${wp.id}`,
      label: `Wallpaper: ${wp.name}`,
      group: "Theme",
      keywords: ["wallpaper", "background", wp.name.toLowerCase()],
      execute: () => {
        setWallpaper(wp.id);
        showToast(`Wallpaper: ${wp.name}`, "success");
      },
    });
  }

  // Utility
  actions.push({
    id: "close-all",
    label: "Close All Windows",
    group: "Utility",
    keywords: ["close", "all", "clear"],
    execute: () => document.dispatchEvent(new CustomEvent("wm:close-all")),
  });
  actions.push({
    id: "refresh",
    label: "Refresh Page",
    group: "Utility",
    keywords: ["refresh", "reload"],
    execute: () => window.location.reload(),
  });
  actions.push({
    id: "clear-cache",
    label: "Clear Cache",
    group: "Utility",
    keywords: ["clear", "cache", "reset", "data"],
    execute: () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    },
  });

  return actions;
}

/* ── Search ─────────────────────────────────────────────── */

function matches(action: Action, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (action.label.toLowerCase().includes(q)) return true;
  return action.keywords.some((k) => k.includes(q));
}

/* ── Component ──────────────────────────────────────────── */

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  openRef.current = open;

  const actions = useMemo(() => buildActions(), []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return actions.filter((a) => matches(a, q) && (a.enabled ? a.enabled() : true));
  }, [query, open, actions]);

  const grouped = useMemo(() => {
    const groups: { name: string; items: Action[] }[] = [];
    for (const name of GROUP_ORDER) {
      const items = filtered.filter((a) => a.group === name);
      if (items.length > 0) groups.push({ name, items });
    }
    return groups;
  }, [filtered]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Clamp selection when results change
  useEffect(() => {
    setSelected((prev) => Math.min(prev, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  const doOpen = useCallback(() => {
    setOpen(true);
    setQuery("");
    setSelected(0);
  }, []);

  const doClose = useCallback(() => setOpen(false), []);

  const doExecute = useCallback(
    (action: Action) => {
      doClose();
      requestAnimationFrame(() => action.execute());
    },
    [doClose],
  );

  // Global listeners — Cmd+K and external toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openRef.current ? doClose() : doOpen();
      }
    };
    const onToggle = () => (openRef.current ? doClose() : doOpen());

    document.addEventListener("keydown", onKey);
    document.addEventListener("palette:toggle", onToggle);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("palette:toggle", onToggle);
    };
  }, [doOpen, doClose]);

  // Auto-focus input on open
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Keep selected item visible
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>("[data-selected]");
    el?.scrollIntoView({ block: "nearest" });
  }, [selected, open]);

  const onInputKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelected((i) => Math.min(i + 1, flat.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelected((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (flat[selected]) doExecute(flat[selected]);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        doClose();
        break;
    }
  };

  if (!open) return null;

  let idx = 0;

  return (
    <div class="palette-backdrop" onClick={doClose}>
      <div
        class="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="palette-input-row">
          <input
            ref={inputRef}
            class="palette-input"
            type="text"
            placeholder="Search..."
            value={query}
            onInput={(e) => {
              setQuery((e.target as HTMLInputElement).value);
              setSelected(0);
            }}
            onKeyDown={onInputKey}
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls="palette-list"
            aria-expanded={true}
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellCheck={false}
          />
        </div>
        <div class="palette-list" id="palette-list" role="listbox" ref={listRef}>
          {flat.length === 0 && <div class="palette-empty">No results</div>}
          {grouped.map((group) => (
            <div class="palette-group" key={group.name}>
              <div class="palette-group-label">{group.name}</div>
              {group.items.map((action) => {
                const i = idx++;
                const isSel = i === selected;
                return (
                  <button
                    key={action.id}
                    class={`palette-item${isSel ? " palette-item--active" : ""}`}
                    role="option"
                    aria-selected={isSel}
                    data-selected={isSel ? "" : undefined}
                    onClick={() => doExecute(action)}
                    onPointerMove={() => setSelected(i)}
                  >
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <span class="palette-shortcut">{action.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
