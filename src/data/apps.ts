/**
 * Portfolio "apps" — each one is a window definition.
 * The `content` HTML is injected into the window body via innerHTML.
 * Look for `EDIT ME` comments to find copy you likely want to rewrite.
 */

export type AppKind = "folder" | "file" | "app";

export interface App {
  id: string;
  title: string;
  kind: AppKind;
  /** Desktop icon label. Omit to hide from desktop. */
  iconLabel?: string;
  /** File extension badge for file icons. */
  iconExt?: string;
  /** Short single-character glyph for the dock icon. Omit to hide from dock. */
  dockGlyph?: string;
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
  <a href="#" data-open-app="links">writing and photography</a>.
  You can <a href="mailto:hello@awln.dev">get in touch</a> or find me
  <a href="#" data-open-app="links">elsewhere</a>.
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

const events = `
<h1 class="display-page">Events</h1>
<p class="lede">Things I'm going to, speaking at, or hosting.</p>

<div class="section-label">Upcoming</div>
<ul class="entry-list">
  <!-- EDIT ME -->
  <li class="entry">
    <div class="entry-title"><span class="entry-ico">▸</span>Event name</div>
    <p class="entry-date">Date · City</p>
    <p class="entry-desc">One-sentence description.</p>
  </li>
</ul>

<div class="section-label">Past</div>
<p class="muted">Nothing here yet.</p>
`.trim();

const contact = `
<h1 class="display-page">Contact</h1>
<p class="lede">The fastest way to reach me.</p>

<section class="focus-box">
  <div class="section-label">Email</div>
  <p><a href="mailto:hello@awln.dev">hello@awln.dev</a></p>
</section>

<p class="muted">
  More channels in the <a href="#" data-open-app="links">Links</a> window.
</p>
`.trim();

// --- Registry ------------------------------------------------------------

export const APPS: App[] = [
  {
    id: "about",
    title: "About",
    kind: "file",
    iconLabel: "about.txt",
    iconExt: "txt",
    dockGlyph: "A",
    defaultSize: { w: 460, h: 480 },
    content: about,
  },
  {
    id: "projects",
    title: "Projects",
    kind: "folder",
    iconLabel: "projects",
    dockGlyph: "P",
    defaultSize: { w: 560, h: 440 },
    content: projects,
  },
  {
    id: "experience",
    title: "Experience",
    kind: "file",
    iconLabel: "experience.md",
    iconExt: "md",
    dockGlyph: "E",
    defaultSize: { w: 600, h: 500 },
    content: experience,
  },
  {
    id: "links",
    title: "Links",
    kind: "folder",
    iconLabel: "links",
    dockGlyph: "L",
    defaultSize: { w: 480, h: 420 },
    content: links,
  },
  {
    id: "tools",
    title: "Tools",
    kind: "app",
    dockGlyph: "T",
    defaultSize: { w: 500, h: 440 },
    content: tools,
  },
  {
    id: "events",
    title: "Events",
    kind: "app",
    dockGlyph: "V",
    defaultSize: { w: 500, h: 420 },
    content: events,
  },
  {
    id: "contact",
    title: "Contact",
    kind: "file",
    iconLabel: "contact",
    iconExt: "vcf",
    dockGlyph: "C",
    defaultSize: { w: 420, h: 340 },
    content: contact,
  },
];
