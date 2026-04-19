// Portfolio apps. Look for `EDIT ME` markers to find placeholder copy.

export type AppKind = "folder" | "file" | "app";

export interface App {
  id: string;
  title: string;
  kind: AppKind;
  /** Desktop icon label (with extension for files). */
  iconLabel: string;
  /** File extension badge for file icons. */
  iconExt?: string;
  /** Custom icon image path (e.g. "/icons/mail.svg"). */
  icon?: string;
  /** Default window size when opened on desktop viewports. */
  defaultSize: { w: number; h: number };
  /** HTML content rendered inside `.window-body`. */
  content: string;
}

// --- Content -------------------------------------------------------------

const about = `
<h1>Alex Whalen</h1>
<p>
  Hey, I'm Alex. This is my website. I miss the old web, so I built something
  that feels like it. I hope you like the place.
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
  <button type="button" class="btn" data-open-app="experience">Open Experience</button>
  <button type="button" class="btn" data-open-app="contact">Contact</button>
</div>
`.trim();

const projects = `
<h1>Projects</h1>
<p class="lede">
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
<p class="lede">Hardware, software, and small extensions and apps I reach for daily. Mostly here so I don't forget when people ask.</p>

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
<h1>Experience</h1>
<p class="lede">
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
<p class="lede">Info about how this site was built and how to navigate it.</p>

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
<h1>Links</h1>
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
<h1>Events</h1>
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
<h1>Pets</h1>
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
        <span class="settings-color-dot" style="background:var(--color-orange)"></span>Orange
      </button>
      <button type="button" class="btn" data-value="green">
        <span class="settings-color-dot" style="background:var(--color-green)"></span>Green
      </button>
      <button type="button" class="btn" data-value="blue">
        <span class="settings-color-dot" style="background:var(--color-blue)"></span>Blue
      </button>
      <button type="button" class="btn" data-value="purple">
        <span class="settings-color-dot" style="background:var(--color-purple)"></span>Purple
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
  </div>
</section>

<section class="settings-section">
  <p class="settings-desc">Links</p>
  <div class="settings-field">
    <span class="settings-label">Underline style</span>
    <div class="btn-group" data-setting="link-style">
      <button type="button" class="btn" data-value="solid"><span style="text-decoration:underline;text-underline-offset:2px">Solid</span></button>
      <button type="button" class="btn" data-value="dotted"><span style="text-decoration:underline dotted;text-decoration-thickness:1.5px;text-underline-offset:2px">Dotted</span></button>
    </div>
  </div>
</section>
`.trim();

const contact = `
<h1>Contact</h1>
<p class="lede">The fastest way to reach me.</p>

<section class="focus-box">
  <div class="section-label">Email</div>
  <p><a href="mailto:hello@awln.dev">hello@awln.dev</a></p>
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
    defaultSize: { w: 550, h: 650 },
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
    defaultSize: { w: 420, h: 340 },
    content: contact,
  },
  {
    id: "links",
    title: "Links",
    kind: "file",
    iconLabel: "links",
    icon: "/icons/links.svg",

    defaultSize: { w: 480, h: 420 },
    content: links,
  },
  {
    id: "events",
    title: "Events",
    kind: "folder",
    iconLabel: "events",
    icon: "/icons/camera.svg",
    defaultSize: { w: 520, h: 440 },
    content: events,
  },
  {
    id: "pets",
    title: "Pets",
    kind: "folder",
    iconLabel: "pets",
    icon: "/icons/cat.svg",
    defaultSize: { w: 520, h: 440 },
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
    id: "help",
    title: "Help",
    kind: "file",
    iconLabel: "help",

    icon: "/icons/help.svg",
    defaultSize: { w: 460, h: 440 },
    content: help,
  },
];
