import { APPS } from "../data/apps";
import {
  currentAccent,
  currentLinkStyle,
  currentTheme,
  currentWallpaper,
  setAccent,
  setLinkStyle,
  setTheme,
  setWallpaper,
} from "./settings";

const ACCENTS = ["orange", "green", "blue", "purple"];
import type { CustomRenderer, RendererActions, WindowState } from "./window-manager";

const WALLPAPERS: { key: string; id: string; name: string }[] = [
  { key: "default", id: "default", name: "Default" },
  { key: "2", id: "wallpaper2", name: "Flying Kitty (macOS)" },
  { key: "3", id: "wallpaper3", name: "Circuit Board (macOS)" },
  { key: "4", id: "wallpaper4", name: "Bliss (Windows XP)" },
  { key: "5", id: "wallpaper5", name: "Hello Light" },
  { key: "6", id: "wallpaper6", name: "Hello Dark" },
];

const wallpaperIdToKey = (id: string) =>
  WALLPAPERS.find((w) => w.id === id)?.key ?? id;

type CmdCategory = "Navigation" | "Utility" | "Info";

interface TerminalIO {
  print: (html: string, variant?: "default" | "muted" | "error") => void;
  printRaw: (node: Node) => void;
  clear: () => void;
  close: () => void;
  openApp: (appId: string) => void;
}

interface Cmd {
  name: string;
  category: CmdCategory;
  summary: string;
  usage?: string;
  run: (args: string[], io: TerminalIO) => void;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );

const ALIASES: Record<string, string> = { cls: "clear" };

function printRows(
  io: TerminalIO,
  rows: { key: string; desc: string }[],
) {
  if (rows.length === 0) return;
  const width = Math.max(...rows.map((r) => r.key.length)) + 4;
  for (const r of rows) {
    io.print(
      `  <span class="terminal-cmd">${r.key.padEnd(width, " ")}</span><span class="terminal-muted">${escapeHtml(r.desc)}</span>`,
    );
  }
}

function buildCommands(): Cmd[] {
  const cmds: Cmd[] = [
    {
      name: "help",
      category: "Info",
      summary: "List commands, or show details for one.",
      usage: "help [command]",
      run(args, io) {
        if (args.length > 0) {
          const target = resolveCommand(args[0]);
          if (!target) {
            io.print(`no help entry for '${escapeHtml(args[0])}'`, "error");
            return;
          }
          io.print(`<span class="terminal-accent">${target.name}</span> — ${escapeHtml(target.summary)}`);
          if (target.usage) io.print(`usage: <span class="terminal-muted">${escapeHtml(target.usage)}</span>`);
          return;
        }
        const groups = new Map<CmdCategory, Cmd[]>();
        for (const c of cmds) {
          const arr = groups.get(c.category) ?? [];
          arr.push(c);
          groups.set(c.category, arr);
        }
        io.print(`<span class="terminal-muted">Type </span>help &lt;command&gt;<span class="terminal-muted"> for details.</span>`);
        for (const [cat, list] of groups) {
          io.print(`<span class="terminal-accent">${cat}</span>`);
          printRows(
            io,
            list.map((c) => ({ key: c.name, desc: c.summary })),
          );
        }
      },
    },
    {
      name: "ls",
      category: "Navigation",
      summary: "List windows you can open.",
      run(_args, io) {
        printRows(
          io,
          APPS.filter((a) => a.id !== "terminal").map((a) => ({
            key: a.id,
            desc: a.title,
          })),
        );
      },
    },
    {
      name: "open",
      category: "Navigation",
      summary: "Open a window by name.",
      usage: "open <app>",
      run(args, io) {
        const id = args[0];
        if (!id) {
          io.print("usage: open &lt;app&gt;", "error");
          return;
        }
        const match = APPS.find((a) => a.id === id);
        if (!match || match.id === "terminal") {
          io.print(`no such window: ${escapeHtml(id)}`, "error");
          return;
        }
        io.openApp(match.id);
      },
    },
    {
      name: "clear",
      category: "Utility",
      summary: "Clear the screen.",
      run(_args, io) {
        io.clear();
      },
    },
    {
      name: "exit",
      category: "Utility",
      summary: "Close the terminal.",
      run(_args, io) {
        io.close();
      },
    },
    {
      name: "echo",
      category: "Utility",
      summary: "Print text back.",
      usage: "echo <text>",
      run(args, io) {
        io.print(escapeHtml(args.join(" ")));
      },
    },
    {
      name: "uptime",
      category: "Info",
      summary: "How long the site has been live.",
      run(_args, io) {
        const start = new Date("2026-04-12T11:00:00-02:30").getTime();
        const ms = Math.max(0, Date.now() - start);
        const totalMinutes = Math.floor(ms / 60000);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        const parts: string[] = [];
        if (days) parts.push(`${days} day${days === 1 ? "" : "s"}`);
        if (hours) parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
        parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
        io.print(`up ${parts.join(", ")}`);
      },
    },
    {
      name: "theme",
      category: "Utility",
      summary: "Switch between light and dark mode.",
      usage: "theme <light|dark>",
      run(args, io) {
        if (args.length === 0) {
          io.print(`<span class="terminal-muted">current: </span>${escapeHtml(currentTheme())}`);
          io.print(`<span class="terminal-muted">available: light, dark</span>`);
          return;
        }
        const value = args[0];
        if (value !== "light" && value !== "dark") {
          io.print("usage: theme &lt;light|dark&gt;", "error");
          return;
        }
        setTheme(value);
        io.print(`<span class="terminal-muted">theme set to </span>${value}`);
      },
    },
    {
      name: "accent",
      category: "Utility",
      summary: "Change the accent color.",
      usage: `accent <${ACCENTS.join("|")}>`,
      run(args, io) {
        if (args.length === 0) {
          io.print(`<span class="terminal-muted">current: </span>${escapeHtml(currentAccent())}`);
          io.print(`<span class="terminal-muted">available: ${ACCENTS.join(", ")}</span>`);
          return;
        }
        const value = args[0];
        if (!ACCENTS.includes(value)) {
          io.print(`usage: accent &lt;${ACCENTS.join("|")}&gt;`, "error");
          return;
        }
        setAccent(value);
        io.print(`<span class="terminal-muted">accent set to </span>${value}`);
      },
    },
    {
      name: "wallpaper",
      category: "Utility",
      summary: "Change the desktop wallpaper.",
      usage: "wallpaper <default|2-6>",
      run(args, io) {
        if (args.length === 0) {
          io.print(`<span class="terminal-muted">current: </span>${escapeHtml(wallpaperIdToKey(currentWallpaper()))}`);
          io.print(`<span class="terminal-muted">available:</span>`);
          printRows(io, WALLPAPERS.map((w) => ({ key: w.key, desc: w.name })));
          return;
        }
        const key = args[0];
        const match = WALLPAPERS.find((w) => w.key === key);
        if (!match) {
          io.print(`usage: wallpaper &lt;${WALLPAPERS.map((w) => w.key).join("|")}&gt;`, "error");
          return;
        }
        setWallpaper(match.id);
        io.print(`<span class="terminal-muted">wallpaper set to </span>${escapeHtml(match.name)}`);
      },
    },
    {
      name: "link",
      category: "Utility",
      summary: "Change link underline style.",
      usage: "link <solid|dotted|none>",
      run(args, io) {
        if (args.length === 0) {
          io.print(`<span class="terminal-muted">current: </span>${escapeHtml(currentLinkStyle())}`);
          io.print(`<span class="terminal-muted">available: solid, dotted, none</span>`);
          return;
        }
        const value = args[0];
        if (value !== "solid" && value !== "dotted" && value !== "none") {
          io.print("usage: link &lt;solid|dotted|none&gt;", "error");
          return;
        }
        setLinkStyle(value);
        io.print(`<span class="terminal-muted">link style set to </span>${value}`);
      },
    },
  ];
  return cmds;
}

const COMMANDS = buildCommands();
const COMMAND_NAMES = COMMANDS.map((c) => c.name).sort();

function resolveCommand(name: string): Cmd | undefined {
  const resolved = ALIASES[name] ?? name;
  return COMMANDS.find((c) => c.name === resolved);
}

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (!strs[i].startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) return "";
  }
  return prefix;
}

function completionsFor(input: string): { candidates: string[]; replaceFrom: number } {
  const trimmedLeading = input.replace(/^\s+/, "");
  const leadingSpaces = input.length - trimmedLeading.length;
  const parts = trimmedLeading.split(/\s+/);

  if (parts.length <= 1) {
    const q = parts[0] ?? "";
    return {
      candidates: [...COMMAND_NAMES, ...Object.keys(ALIASES)].filter((n) => n.startsWith(q)),
      replaceFrom: leadingSpaces,
    };
  }

  const cmd = parts[0];
  const last = parts[parts.length - 1];
  const replaceFrom = input.length - last.length;

  if (cmd === "open") {
    const ids = APPS.filter((a) => a.id !== "terminal").map((a) => a.id);
    return { candidates: ids.filter((id) => id.startsWith(last)), replaceFrom };
  }
  if (cmd === "help") {
    return { candidates: COMMAND_NAMES.filter((n) => n.startsWith(last)), replaceFrom };
  }
  if (cmd === "theme") {
    return { candidates: ["light", "dark"].filter((n) => n.startsWith(last)), replaceFrom };
  }
  if (cmd === "accent") {
    return { candidates: ACCENTS.filter((n) => n.startsWith(last)), replaceFrom };
  }
  if (cmd === "wallpaper") {
    return { candidates: WALLPAPERS.map((w) => w.key).filter((k) => k.startsWith(last)), replaceFrom };
  }
  if (cmd === "link") {
    return { candidates: ["solid", "dotted", "none"].filter((n) => n.startsWith(last)), replaceFrom };
  }
  return { candidates: [], replaceFrom };
}

export const terminalRenderer: CustomRenderer = {
  populate(body) {
    body.classList.add("terminal-view");
    body.innerHTML = `
      <div class="terminal-output" data-terminal-output></div>
      <div class="terminal-prompt-line">
        <span class="terminal-prompt" aria-hidden="true"><span class="terminal-user">alex@awlnOS</span> <span class="terminal-path">~</span> <span class="terminal-caret">$</span></span>
        <input class="terminal-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal input" />
      </div>
    `;
  },

  onReady(state: WindowState, actions: RendererActions) {
    const body = state.body;
    const output = body.querySelector<HTMLElement>("[data-terminal-output]")!;
    const input = body.querySelector<HTMLInputElement>(".terminal-input")!;

    const history: string[] = [];
    let historyIndex = -1;
    let draft = "";

    const scrollToBottom = () => {
      body.scrollTop = body.scrollHeight;
    };

    const print = (html: string, variant: "default" | "muted" | "error" = "default") => {
      const line = document.createElement("div");
      line.className =
        variant === "error"
          ? "terminal-line terminal-line-error"
          : variant === "muted"
            ? "terminal-line terminal-line-muted"
            : "terminal-line";
      line.innerHTML = html;
      output.appendChild(line);
      scrollToBottom();
    };

    const printRaw = (node: Node) => {
      output.appendChild(node);
      scrollToBottom();
    };

    const clear = () => {
      output.replaceChildren();
    };

    const io: TerminalIO = {
      print,
      printRaw,
      clear,
      close: () => actions.closeWindow(state.id),
      openApp: actions.openApp,
    };

    // Echo the submitted command as a dimmed history line.
    const echoCommand = (raw: string) => {
      const line = document.createElement("div");
      line.className = "terminal-line terminal-line-echo";
      line.innerHTML = `<span class="terminal-prompt-ghost"><span class="terminal-user">alex@awlnOS</span> <span class="terminal-path">~</span> <span class="terminal-caret">$</span></span> ${escapeHtml(raw)}`;
      output.appendChild(line);
    };

    const run = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        echoCommand("");
        scrollToBottom();
        return;
      }
      echoCommand(trimmed);
      const [name, ...rest] = trimmed.split(/\s+/);
      const cmd = resolveCommand(name);
      if (!cmd) {
        print(`command not found: ${escapeHtml(name)}`, "error");
        scrollToBottom();
        return;
      }
      cmd.run(rest, io);
      scrollToBottom();
    };

    const focusInput = () => {
      if (document.activeElement !== input) input.focus({ preventScroll: true });
    };

    // Clicking anywhere in the body (not on text they might be selecting) focuses input.
    body.addEventListener("mousedown", (e) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      // Let the user select text if they're dragging — only focus on simple clicks.
      if (window.getSelection()?.toString()) return;
      // Defer to let the default click resolve; then steal focus to input.
      requestAnimationFrame(focusInput);
    });

    // When the host window gains focus, focus the input.
    const observer = new MutationObserver(() => {
      if (state.el.hasAttribute("data-focused")) focusInput();
    });
    observer.observe(state.el, { attributes: true, attributeFilter: ["data-focused"] });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = input.value;
        input.value = "";
        if (value.trim()) {
          history.push(value);
          if (history.length > 100) history.shift();
        }
        historyIndex = -1;
        draft = "";
        run(value);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const { candidates, replaceFrom } = completionsFor(input.value);
        if (candidates.length === 0) return;
        if (candidates.length === 1) {
          input.value = input.value.slice(0, replaceFrom) + candidates[0] + " ";
          return;
        }
        const prefix = longestCommonPrefix(candidates);
        const current = input.value.slice(replaceFrom);
        if (prefix.length > current.length) {
          input.value = input.value.slice(0, replaceFrom) + prefix;
          return;
        }
        // Multiple matches, no further prefix — print candidates, keep input.
        print(candidates.join("  "), "muted");
        return;
      }

      if (e.key === "ArrowUp") {
        if (history.length === 0) return;
        e.preventDefault();
        if (historyIndex === -1) {
          draft = input.value;
          historyIndex = history.length - 1;
        } else if (historyIndex > 0) {
          historyIndex--;
        }
        input.value = history[historyIndex];
        // Move cursor to end.
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
        return;
      }

      if (e.key === "ArrowDown") {
        if (historyIndex === -1) return;
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex];
        } else {
          historyIndex = -1;
          input.value = draft;
        }
        requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
        return;
      }

      if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        clear();
        return;
      }
    });

    // Intro.
    print(`<span class="terminal-accent">awlnOS terminal v1.0</span>`);
    print(`<span class="terminal-muted">type 'help' to get started.</span>`);
    print("");

    focusInput();
  },
};
