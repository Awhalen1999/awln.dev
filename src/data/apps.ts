// Portfolio apps. Look for `EDIT ME` markers to find placeholder copy.

export type AppKind = "folder" | "file" | "app";
export type DockIcon =
  | "info"
  | "folder"
  | "tools"
  | "briefcase"
  | "gear"
  | "chain";

export interface App {
  id: string;
  title: string;
  kind: AppKind;
  /** Desktop icon label. Omit to hide from desktop. */
  iconLabel?: string;
  /** File extension badge for file icons. */
  iconExt?: string;
  /** Pixel-art icon for the dock. Omit to hide from dock. */
  dockIcon?: DockIcon;
  /** Default window size when opened on desktop viewports. */
  defaultSize: { w: number; h: number };
  /** HTML content rendered inside `.window-body`. */
  content: string;
}

// --- Content -------------------------------------------------------------

const about = `
<!-- EDIT ME: bio, current focus, anything else you want up top -->
<h1 class="display-name">
  <span>Alex</span>
  <span class="dash">—</span>
  <span>Whalen</span>
</h1>
<p class="lede">
  I'm a software engineer who enjoys building thoughtful, high-quality digital
  products. I like translating complex ideas into interfaces that feel clear,
  reliable, and fast.
</p>
<p>
  Outside of code I like
  <a href="#links" data-open-app="links">writing and photography</a>.
  You can <a href="mailto:hello@awln.dev">get in touch</a> or find me
  <a href="#links" data-open-app="links">elsewhere</a>.
</p>

<section class="focus-box">
  <div class="section-label">Current Focus</div>
  <ul>
    <li>Shipping small, focused tools that do one thing well.</li>
    <li>Writing notes on what I learn along the way.</li>
    <li>Continuing to sharpen the craft — design, typography, systems.</li>
  </ul>
</section>

<div class="section-label">Full Timeline</div>
<p class="muted">
  See the complete experience timeline in a dedicated window with full role context.
</p>
<button type="button" class="pill-btn" data-open-app="experience">Open Experience</button>
`.trim();

const projects = `
<h1 class="display-page">Projects</h1>
<p class="lede">
  Selected work, side projects, and experiments. Each one is a small piece of
  craft I'm proud of — click through to learn more.
</p>

<div class="section-label">Project List</div>
<ul class="entry-list">
  <!-- EDIT ME: add your projects here -->
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Project Title One</span>
      <span class="badge">Live</span>
    </div>
    <p class="entry-date">2025 · 4 mos · <a href="#" target="_blank" rel="noopener">link</a></p>
    <p class="entry-desc">What it does, what was interesting about it, the outcome or current state.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Project Title Two</span>
    </div>
    <p class="entry-date">2024 · 2 mos</p>
    <p class="entry-desc">What it does, what was interesting about it, the outcome or current state.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Project Title Three</span>
    </div>
    <p class="entry-date">2023 · 6 mos</p>
    <p class="entry-desc">What it does, what was interesting about it, the outcome or current state.</p>
  </li>
</ul>
`.trim();

const tools = `
<h1 class="display-page">Tools</h1>
<p class="lede">Hardware, software, and small things I reach for daily.</p>

<div class="section-label">Software</div>
<ul class="entry-list">
  <!-- EDIT ME -->
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Tool Name</div>
    <p class="entry-desc">Why you use it.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Tool Name</div>
    <p class="entry-desc">Why you use it.</p>
  </li>
</ul>

<div class="section-label">Hardware</div>
<ul class="entry-list">
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Item</div>
    <p class="entry-desc">One-line note.</p>
  </li>
</ul>
`.trim();

const experience = `
<h1 class="display-page">Experience</h1>
<p class="lede">
  A detailed timeline of my experience, current focus, and professional growth.
</p>

<section class="focus-box">
  <div class="section-label">Current Focus</div>
  <ul>
    <li>Shipping small, focused tools that do one thing well.</li>
    <li>Writing notes on what I learn along the way.</li>
    <li>Continuing to sharpen the craft.</li>
  </ul>
</section>

<div class="section-label">Career Timeline</div>
<ul class="entry-list">
  <!-- EDIT ME: add your roles -->
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Role Title</span>
      <span class="muted">· Company · Full-time</span>
      <span class="badge">Current</span>
    </div>
    <p class="entry-date">Jan 2024 — Present</p>
    <p class="entry-desc">What you're doing here — responsibilities, impact, interesting challenges.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Previous Role</span>
      <span class="muted">· Company · Contract</span>
    </div>
    <p class="entry-date">Jun 2022 — Dec 2023 · 1 yr 7 mos</p>
    <p class="entry-desc">Highlights from this role.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <span>Earlier Role</span>
      <span class="muted">· Company</span>
    </div>
    <p class="entry-date">2020 — 2022 · 2 yrs</p>
    <p class="entry-desc">Highlights from this role.</p>
  </li>
</ul>
`.trim();

const settings = `
<h1 class="display-page">Settings</h1>
<p class="lede">Site preferences and info about how this was built.</p>

<div class="section-label">About this site</div>
<p>
  Built with <a href="https://astro.build" target="_blank" rel="noopener">Astro</a>.
  Type is set in Newsreader and DM Sans.
  Source on <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>.
</p>

<div class="section-label">Theme</div>
<p class="muted">Light mode only for now — a dark variant is on the roadmap.</p>

<div class="section-label">Keyboard</div>
<ul class="entry-list">
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Escape</div>
    <p class="entry-desc">Close the focused window.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Double-click title bar</div>
    <p class="entry-desc">Toggle fullscreen for the focused window.</p>
  </li>
</ul>
`.trim();

const links = `
<h1 class="display-page">Links</h1>
<p class="lede">Where to find me around the internet.</p>

<ul class="entry-list">
  <!-- EDIT ME: update these URLs -->
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
    </div>
    <p class="entry-desc">Code I share publicly.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="https://linkedin.com/" target="_blank" rel="noopener">LinkedIn</a>
    </div>
    <p class="entry-desc">Career history and professional network.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="https://x.com/" target="_blank" rel="noopener">X / Twitter</a>
    </div>
    <p class="entry-desc">Occasional thoughts, mostly about building.</p>
  </li>
  <li class="entry">
    <div class="entry-title">
      <span class="entry-ico">▸</span>
      <a href="mailto:hello@awln.dev">Email</a>
    </div>
    <p class="entry-desc">Best for longer conversations.</p>
  </li>
</ul>
`.trim();

const events = `
<h1 class="display-page">Events</h1>
<p class="lede">Photos and notes from events I've been to or hosted.</p>

<div class="section-label">Archive</div>
<ul class="entry-list">
  <!-- EDIT ME: swap these entries for real events / photo galleries -->
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Event name</div>
    <p class="entry-date">Date · City</p>
    <p class="entry-desc">A line or two about what it was.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Another event</div>
    <p class="entry-date">Date · City</p>
    <p class="entry-desc">A line or two about what it was.</p>
  </li>
</ul>
`.trim();

const pets = `
<h1 class="display-page">Pets</h1>
<p class="lede">Photos and info about the animals in my life.</p>

<div class="section-label">Roster</div>
<ul class="entry-list">
  <!-- EDIT ME: swap in your pets and their photos -->
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Pet name</div>
    <p class="entry-date">Species · Age</p>
    <p class="entry-desc">One-line intro — breed, favorite thing, personality.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Another pet</div>
    <p class="entry-date">Species · Age</p>
    <p class="entry-desc">One-line intro.</p>
  </li>
</ul>
`.trim();

const contact = `
<h1 class="display-page">Contact</h1>
<p class="lede">The fastest way to reach me.</p>

<section class="focus-box">
  <div class="section-label">Email</div>
  <p><a href="mailto:hello@awln.dev">hello@awln.dev</a></p>
</section>

<p class="muted">
  More channels in the <a href="#links" data-open-app="links">Links</a> window.
</p>
`.trim();

const current = `
<h1 class="display-page">Current</h1>
<p class="lede">What I'm focused on right now.</p>

<section class="focus-box">
  <div class="section-label">This Week</div>
  <ul>
    <!-- EDIT ME -->
    <li>Polishing this site and writing its first post.</li>
    <li>Reading on typography and systems design.</li>
    <li>Shipping a small tool I've been tinkering with.</li>
  </ul>
</section>

<div class="section-label">This Quarter</div>
<ul class="entry-list">
  <!-- EDIT ME -->
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Goal One</div>
    <p class="entry-desc">One-line description of what success looks like.</p>
  </li>
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Goal Two</div>
    <p class="entry-desc">One-line description.</p>
  </li>
</ul>

<div class="section-label">Later</div>
<p class="muted">Longer-horizon things live in <a href="#experience" data-open-app="experience">Experience</a>.</p>
`.trim();

// --- Registry ------------------------------------------------------------

export const APPS: App[] = [
  // Dock
  {
    id: "about",
    title: "About",
    kind: "app",
    dockIcon: "info",
    defaultSize: { w: 460, h: 480 },
    content: about,
  },
  {
    id: "projects",
    title: "Projects",
    kind: "app",
    dockIcon: "folder",
    defaultSize: { w: 560, h: 440 },
    content: projects,
  },
  {
    id: "tools",
    title: "Tools",
    kind: "app",
    dockIcon: "tools",
    defaultSize: { w: 500, h: 440 },
    content: tools,
  },
  {
    id: "experience",
    title: "Experience",
    kind: "app",
    dockIcon: "briefcase",
    defaultSize: { w: 600, h: 500 },
    content: experience,
  },
  {
    id: "settings",
    title: "Settings",
    kind: "app",
    dockIcon: "gear",
    defaultSize: { w: 460, h: 440 },
    content: settings,
  },
  {
    id: "links",
    title: "Links",
    kind: "app",
    dockIcon: "chain",
    defaultSize: { w: 480, h: 420 },
    content: links,
  },
  // Desktop
  {
    id: "events",
    title: "Events",
    kind: "folder",
    iconLabel: "events",
    defaultSize: { w: 520, h: 440 },
    content: events,
  },
  {
    id: "pets",
    title: "Pets",
    kind: "folder",
    iconLabel: "pets",
    defaultSize: { w: 520, h: 440 },
    content: pets,
  },
  {
    id: "contact",
    title: "Contact",
    kind: "file",
    iconLabel: "contact.md",
    iconExt: "md",
    defaultSize: { w: 420, h: 340 },
    content: contact,
  },
  {
    id: "current",
    title: "Current",
    kind: "file",
    iconLabel: "current.txt",
    iconExt: "txt",
    defaultSize: { w: 460, h: 460 },
    content: current,
  },
];
