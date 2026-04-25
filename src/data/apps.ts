// Portfolio apps. Look for `EDIT ME` markers to find placeholder copy.

export type AppKind = "folder" | "file" | "app";

export interface App {
  id: string;
  title: string;
  kind: AppKind;
  /** Desktop icon label (with extension for files). */
  iconLabel: string;
  /** Custom icon image path (e.g. "/icons/mail.svg"). Falls back to the folder icon. */
  icon?: string;
  /** Default window size when opened on desktop viewports. */
  defaultSize: { w: number; h: number };
  /** Set to false to disable window resizing. */
  resizable?: boolean;
  /** HTML content rendered inside `.window-body`. */
  content: string;
}

// --- Content -------------------------------------------------------------

const about = `
<h1>Alex Whalen</h1>
<p>
  Hey, I'm Alex. This is my website. I hope you like the place.
</p>
<p>
  I'm a serial SaaS developer with way too many <em>amazing and revolutionary</em>
  ideas. I'm also a bit of a nerd and love turning said ideas into real tools that
  people <em>(me)</em> actually use. Here are some of the
  <a href="#tools" data-open-app="tools">tools</a> I use everyday if you're interested.
</p>
<p>
  Right now, I'm working at <a href="https://enaimco.com" target="_blank" rel="noopener">Enaimco</a>
  as a software developer. I'm also working on various <em>(too many)</em>
  <a href="#projects" data-open-app="projects">projects</a>. When I find the time,
  I try to attend as many <a href="#events" data-open-app="events">hackathons and events</a> as I can.
</p>
<p>
  Outside of coding, I enjoy exploring new places, sports,
  <a href="https://letterboxd.com/Awln/" target="_blank" rel="noopener">anime and movies</a>.
  <em>Oh and trying way too hard to be good at running...</em>
</p>
<p>
  I'm currently based in 📍 St. John's NL, if you are around,
  <a href="#links" data-open-app="links">reach out</a> and let's have some ☕ or
  work together.
</p>

<img src="/transparent-sig-black.gif" alt="AW signature" class="signature signature-light" />
<img src="/transparent-sig-white.gif" alt="AW signature" class="signature signature-dark" />

<div class="btn-row">
  <button type="button" class="btn-feature" data-open-app="experience">Open Experience</button>
  <button type="button" class="btn-feature" data-open-app="contact">Contact</button>
</div>
`.trim();

const projects = `
<h1>Projects</h1>
<p>
  Some are finished, some are works in progress. My <a href="https://github.com/awhalen1999" target="_blank" rel="noopener">GitHub</a> is probably more up to date with older and dinky little projects as well.
</p>

<ul class="entry-list">
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>RallyMail</span>
      <span class="badge">Current Focus</span>
    </div>
    <p class="entry-date">2026</p>
    <p class="entry-desc">A custom email client for fitness coaches. Pulls client threads into one place alongside their profiles and context, with built-in AI.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>blob.you</span>
      <span class="badge">Live</span>
    </div>
    <p class="entry-date">2026 · <a href="https://blob.you" target="_blank" rel="noopener">blob.you</a></p>
    <p class="entry-desc">Draw shapes and watch them fight with physics. Multiplayer via websockets, with a Discord coin currency wagering system.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>cooked.photo</span>
      <span class="badge">Live</span>
    </div>
    <p class="entry-date">2026 · <a href="https://cooked.photo" target="_blank" rel="noopener">cooked.photo</a></p>
    <p class="entry-desc">A web app with a bunch of filters for twisting and breaking photos in interesting ways.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Kaboodle</span>
      <span class="badge">Live</span>
    </div>
    <p class="entry-date">2025 · <a href="https://kaboodle.now" target="_blank" rel="noopener">kaboodle.now</a></p>
    <p class="entry-desc">A mobile app for creating and sharing packing lists for your adventures.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Pluck</span>
    </div>
    <p class="entry-date">2025 · <a href="https://github.com/Awhalen1999/pluck" target="_blank" rel="noopener">GitHub</a></p>
    <p class="entry-desc">A macOS design tool that keeps your design inspiration visible in a side notch while you work.</p>
  </li>
</ul>
`.trim();

const tools = `
<h1>Tools</h1>
<p>Hardware, software, apps, and extensions I reach for daily. Mostly here so I don't forget when people ask.</p>

<div class="subhead">Hardware</div>
<ul class="tool-list">
  <li><strong>Laptop</strong> <span class="muted">Macbook Pro 13 M1</span></li>
  <li><strong>Mouse</strong> <span class="muted">Logitech MX Master 3</span></li>
  <li><strong>Keyboard</strong> <span class="muted">ProtoArc Ergonomic</span></li>
  <li><strong>Monitor</strong> <span class="muted">LG 32GS95UE-B 32"</span></li>
  <li><strong>Chair</strong> <span class="muted">Steelcase Amia 2013</span></li>
  <li><strong>Headphones</strong> <span class="muted">Apple AirPods Pro</span></li>
  <li><strong>Lighting</strong> <span class="muted">Quntis Monitor Lamp</span></li>
</ul>

<div class="subhead">Development</div>
<ul class="tool-list">
  <li><strong>Cursor</strong> <span class="muted">My primary code editor</span></li>
  <li><strong>Fonts</strong> <span class="muted">JetBrains Mono / Fira Code</span></li>
  <li><strong>Theme</strong> <span class="muted">xpcode dark / Vitesse light</span></li>
  <li><strong>Icon Theme</strong> <span class="muted">Catppuccin icons</span></li>
  <li><strong>Product Icons</strong> <span class="muted">Carbon icons</span></li>
  <li><strong>Formatting</strong> <span class="muted">Prettier & ESLint</span></li>
  <li><strong>Terminal</strong> <span class="muted">Ghostty + cmux</span></li>
  <li><strong>Package Manager</strong> <span class="muted">pnpm</span></li>
</ul>

<div class="subhead">Browser</div>
<ul class="tool-list">
  <li><strong>Firefox</strong> <span class="muted">My preferred web browser</span></li>
  <li class="tool-nested"><strong>uBlock Origin</strong> <span class="muted">Ad blocker</span></li>
  <li class="tool-nested"><strong>Privacy Badger</strong> <span class="muted">Privacy protection</span></li>
  <li class="tool-nested"><strong>Refined GitHub</strong> <span class="muted">GitHub improvements</span></li>
  <li class="tool-nested"><strong>File Icons for GitHub</strong> <span class="muted">Why is this not a default feature?</span></li>
  <li class="tool-nested"><strong>Refined YouTube</strong> <span class="muted">YouTube improvements</span></li>
  <li class="tool-nested"><strong>React Developer Tools</strong> <span class="muted">Debugging web apps</span></li>
  <li class="tool-nested"><strong>WhatFont</strong> <span class="muted">Identify fonts on web pages</span></li>
  <li class="tool-nested"><strong>ColorZilla</strong> <span class="muted">Color picker and eyedropper</span></li>
</ul>

<div class="subhead">Productivity</div>
<ul class="tool-list">
  <li><strong>Kap</strong> <span class="muted">Screen recorder</span></li>
  <li><strong>Obsidian</strong> <span class="muted">Notes</span></li>
  <li><strong>GitHub Desktop</strong> <span class="muted">Better GitHub experience</span></li>
  <li><strong>Claude</strong> <span class="muted">My preferred AI agent</span></li>
  <li><strong>Figma</strong> <span class="muted">Design software</span></li>
  <li><strong>Mobbin</strong> <span class="muted">Design inspiration</span></li>
  <li><strong>Eagle</strong> <span class="muted">Design file organization</span></li>
</ul>
`.trim();

const experience = `
<h1>Experience</h1>
<p>
  Where I've been, what I've done, and proof I don't just make side projects all day.
</p>

<ul class="entry-list">
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Full-Stack Software Developer</span>
      <span class="badge">Current</span>
    </div>
    <p class="entry-date">St. John's, NL · <a href="https://enaimco.com" target="_blank" rel="noopener">Enaimco</a></p>
    <p class="entry-desc">Part of the core product team modernizing subsea energy operations. Building frontend features and optimizing backend performance, maintainability, and tooling.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Enterprise Software Team Lead</span>
    </div>
    <p class="entry-date">St. John's, NL · Nutraforge Technologies</p>
    <p class="entry-desc">Led development of an enterprise application for nutrition professionals. Worked on mobile applications, Stripe billing, RBAC, and backend optimizations that cut latency by > 50%.</p>
  </li>
</ul>
`.trim();

const help = `
<h1>Help</h1>
<p>Quick reference for finding your way around.</p>

<div class="subhead">About</div>
<p>Built with <a href="https://astro.build" target="_blank" rel="noopener">Astro</a> and TypeScript. Source code lives on <a href="https://github.com/Awhalen1999" target="_blank" rel="noopener">GitHub</a>.</p>

<div class="subhead">Keyboard</div>
<ul class="entry-list">
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Cmd+K</div>
    <p class="entry-desc">Open the command palette.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Escape</div>
    <p class="entry-desc">Close the focused window.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Double-click title bar</div>
    <p class="entry-desc">Toggle fullscreen for the focused window.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Cmd+Opt+T</div>
    <p class="entry-desc">Open the terminal.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Cmd+Opt+F</div>
    <p class="entry-desc">Fullscreen the focused window.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Cmd+Opt+C</div>
    <p class="entry-desc">Re-center the focused window.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Cmd+Opt+W</div>
    <p class="entry-desc">Close the focused window.</p>
  </li>
</ul>

<div class="subhead">Actions</div>
<div class="btn-row">
  <button type="button" class="btn-secondary" data-util="refresh">Refresh</button>
  <button type="button" class="btn-secondary" data-util="clear-cache">Clear cache</button>
  <button type="button" class="btn-secondary" data-util="close-all">Close all windows</button>
</div>
`.trim();

const links = `
<h1>Links</h1>
<p>Where to find me around the internet.</p>

<ul class="entry-list">
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="https://github.com/Awhalen1999" target="_blank" rel="noopener">GitHub</a>
      <button type="button" class="btn-secondary btn-copy" data-copy="https://github.com/Awhalen1999">Copy</button>
    </div>
    <p class="entry-desc">Code I share publicly</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="https://www.linkedin.com/in/alex-whalen-0496b227b" target="_blank" rel="noopener">LinkedIn</a>
      <button type="button" class="btn-secondary btn-copy" data-copy="https://www.linkedin.com/in/alex-whalen-0496b227b">Copy</button>
    </div>
    <p class="entry-desc">Career history and network</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="mailto:awhalendev@gmail.com">Email</a>
      <button type="button" class="btn-secondary btn-copy" data-copy="awhalendev@gmail.com">Copy</button>
    </div>
    <p class="entry-desc">awhalendev@gmail.com</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="/alex_whalen_resume.pdf" download>Resume</a>
      <a href="/alex_whalen_resume.pdf" download class="btn-secondary btn-copy">Download Resume</a>
    </div>
    <p class="entry-desc">PDF · latest version</p>
  </li>
</ul>
`.trim();

const events = `
<h1>Events</h1>
<p>Photos from events I've been to or hosted.</p>

<ul class="photo-grid">
  <li class="photo-item">
    <button type="button" class="photo-thumb" data-open-image="/events/spellbook-demo.avif" data-image-title="Spellbook Demo Night">
      <img src="/events/spellbook-demo.avif" alt="Spellbook Demo Night" loading="lazy" />
    </button>
    <span class="photo-label">Spellbook Demo Night</span>
  </li>
  <li class="photo-item">
    <button type="button" class="photo-thumb" data-open-image="/events/cts-meetups.avif" data-image-title="Weekly CTS Meetups">
      <img src="/events/cts-meetups.avif" alt="Weekly CTS Meetups" loading="lazy" />
    </button>
    <span class="photo-label">Weekly CTS Meetups</span>
  </li>
  <li class="photo-item">
    <button type="button" class="photo-thumb" data-open-image="/events/get-building-hackathon.avif" data-image-title="Get Building Hackathon">
      <img src="/events/get-building-hackathon.avif" alt="Get Building Hackathon" loading="lazy" />
    </button>
    <span class="photo-label">Get Building Hackathon</span>
  </li>
  <li class="photo-item">
    <button type="button" class="photo-thumb" data-open-image="/events/get-building-demo.avif" data-image-title="Get Building Demo Night">
      <img src="/events/get-building-demo.avif" alt="Get Building Demo Night" loading="lazy" />
    </button>
    <span class="photo-label">Get Building Demo Night</span>
  </li>
</ul>
`.trim();

const pets = "";

const siteSettings = `
<h1>Settings</h1>

<section class="settings-section">
  <p class="settings-desc">Appearance</p>

  <div class="settings-field">
    <span class="settings-label">Theme mode</span>
    <div class="btn-group" data-setting="theme">
      <button type="button" class="btn" data-value="light">Light</button>
      <button type="button" class="btn" data-value="dark">Dark</button>
    </div>
  </div>

  <div class="settings-field">
    <span class="settings-label">Theme color</span>
    <div class="btn-group" data-setting="accent">
      <button type="button" class="btn" data-value="orange">
        <span class="settings-color-dot" data-color="orange"></span>Orange
      </button>
      <button type="button" class="btn" data-value="green">
        <span class="settings-color-dot" data-color="green"></span>Green
      </button>
      <button type="button" class="btn" data-value="blue">
        <span class="settings-color-dot" data-color="blue"></span>Blue
      </button>
      <button type="button" class="btn" data-value="purple">
        <span class="settings-color-dot" data-color="purple"></span>Purple
      </button>
    </div>
  </div>
</section>

<section class="settings-section">
  <p class="settings-desc">Wallpaper</p>
  <div class="wallpaper-grid">
    <button type="button" class="wallpaper-thumb" data-wallpaper="default">
      <span class="wallpaper-preview" style="background-color:var(--wallpaper)"></span>
      <span class="wallpaper-name">Default</span>
    </button>
    <button type="button" class="wallpaper-thumb" data-wallpaper="wallpaper2">
      <span class="wallpaper-preview" style="background-image:url(/wallpapers/wallpaper2.png)"></span>
      <span class="wallpaper-name">Flying Kitty (macOS)</span>
    </button>
    <button type="button" class="wallpaper-thumb" data-wallpaper="wallpaper3">
      <span class="wallpaper-preview" style="background-image:url(/wallpapers/wallpaper3.png)"></span>
      <span class="wallpaper-name">Circuit Board (macOS)</span>
    </button>
    <button type="button" class="wallpaper-thumb" data-wallpaper="wallpaper4">
      <span class="wallpaper-preview" style="background-image:url(/wallpapers/wallpaper4.png)"></span>
      <span class="wallpaper-name">Bliss (Windows XP)</span>
    </button>
    <button type="button" class="wallpaper-thumb" data-wallpaper="wallpaper5">
      <span class="wallpaper-preview" style="background-image:url(/wallpapers/wallpaper5.png)"></span>
      <span class="wallpaper-name">Hello Light</span>
    </button>
    <button type="button" class="wallpaper-thumb" data-wallpaper="wallpaper6">
      <span class="wallpaper-preview" style="background-image:url(/wallpapers/wallpaper6.png)"></span>
      <span class="wallpaper-name">Hello Dark</span>
    </button>
  </div>
</section>

<section class="settings-section">
  <p class="settings-desc">Links</p>
  <div class="settings-field">
    <span class="settings-label">Underline style</span>
    <div class="btn-group" data-setting="link-style">
      <button type="button" class="btn" data-value="solid"><span class="link-preview link-preview--solid">Solid</span></button>
      <button type="button" class="btn" data-value="dotted"><span class="link-preview link-preview--dotted">Dotted</span></button>
      <button type="button" class="btn" data-value="none">None</button>
    </div>
  </div>
</section>
`.trim();

const contact = `
<h1>Contact</h1>
<p>The best way to reach me.</p>

<section class="focus-box email-box">
  <p><a href="mailto:awhalendev@gmail.com">awhalendev@gmail.com</a></p>
  <button type="button" class="btn-secondary btn-copy" data-copy="awhalendev@gmail.com">Copy</button>
</section>

<p class="muted">
  More channels in the <a href="#links" data-open-app="links">Links</a> window.
</p>
`.trim();

// --- Registry ------------------------------------------------------------
// Array order = desktop order. Icons flow top-to-bottom in column 1, then
// wrap into subsequent columns based on viewport height.

export const APPS: App[] = [
  // Who I am / what I do
  {
    id: "about",
    title: "About",
    kind: "file",
    iconLabel: "about",

    icon: "/icons/man.svg",
    defaultSize: { w: 650, h: 600 },
    content: about,
  },
  {
    id: "projects",
    title: "Projects",
    kind: "folder",
    iconLabel: "projects",
    defaultSize: { w: 600, h: 550 },
    content: projects,
  },
  {
    id: "experience",
    title: "Experience",
    kind: "file",
    iconLabel: "experience",

    icon: "/icons/man2.svg",
    defaultSize: { w: 450, h: 500 },
    content: experience,
  },
  {
    id: "tools",
    title: "Tools",
    kind: "file",
    iconLabel: "tools",

    icon: "/icons/tools.svg",
    defaultSize: { w: 450, h: 600 },
    content: tools,
  },

  // Reach / misc
  {
    id: "contact",
    title: "Contact",
    kind: "file",
    iconLabel: "contact",

    icon: "/icons/mail.svg",
    defaultSize: { w: 400, h: 300 },
    content: contact,
  },
  {
    id: "links",
    title: "Links",
    kind: "file",
    iconLabel: "links",
    icon: "/icons/links.svg",

    defaultSize: { w: 480, h: 500 },
    content: links,
  },
  {
    id: "events",
    title: "Events",
    kind: "folder",
    iconLabel: "events",
    icon: "/icons/camera.svg",
    defaultSize: { w: 850, h: 550 },
    content: events,
  },
  {
    id: "pets",
    title: "Pets",
    kind: "folder",
    iconLabel: "pets",
    icon: "/icons/cat.svg",
    defaultSize: { w: 700, h: 500 },
    resizable: false,
    content: pets,
  },
  {
    id: "site-settings",
    title: "Site Settings",
    kind: "file",
    iconLabel: "site settings",
    icon: "/icons/settings.svg",
    defaultSize: { w: 650, h: 500 },
    content: siteSettings,
  },
  {
    id: "terminal",
    title: "Terminal",
    kind: "app",
    iconLabel: "terminal",
    icon: "/icons/terminal.svg",
    defaultSize: { w: 700, h: 500 },
    content: "",
  },
  {
    id: "help",
    title: "Help",
    kind: "file",
    iconLabel: "help",

    icon: "/icons/help.svg",
    defaultSize: { w: 450, h: 500 },
    content: help,
  },

  // Easter egg — shows in terminal `ls` but not on the desktop.
  {
    id: "passwords",
    title: "passwords",
    kind: "file",
    iconLabel: "passwords",
    icon: "/icons/text-file.svg",
    defaultSize: { w: 600, h: 340 },
    content: "",
  },
];
