const IDLE_TIMEOUT = 45_000;
const FACE_SIZE = 150;
const SPEED = 2;
const FADE_MS = 300;

let idleTimer: ReturnType<typeof setTimeout>;
let animFrame: number;
let active = false;

let x = 0;
let y = 0;
let dx = SPEED;
let dy = SPEED;

let overlay: HTMLDivElement;
let logo: HTMLImageElement;

function createOverlay() {
  overlay = document.createElement("div");
  overlay.className = "screensaver-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
    opacity: "0",
    transition: `opacity ${FADE_MS}ms ease`,
  });

  logo = document.createElement("img");
  logo.src = "/face.png";
  logo.alt = "";
  logo.draggable = false;
  Object.assign(logo.style, {
    position: "absolute",
    width: `${FACE_SIZE}px`,
    height: `${FACE_SIZE}px`,
    imageRendering: "pixelated",
    transition: "filter 0.3s ease",
  });

  overlay.appendChild(logo);
  document.body.appendChild(overlay);
}

function fadeUI(out: boolean) {
  const menubar = document.querySelector<HTMLElement>("[data-menubar]");
  const surface = document.querySelector<HTMLElement>(".desktop-surface");
  const sprite = document.querySelector<HTMLElement>("[data-me-sprite]");
  if (!menubar || !surface) return;

  for (const el of [menubar, surface, sprite].filter(Boolean) as HTMLElement[]) {
    el.style.transition = `opacity ${FADE_MS}ms ease`;
    el.style.opacity = out ? "0" : "1";
  }

  if (!out) {
    setTimeout(() => {
      for (const el of [menubar, surface, sprite].filter(Boolean) as HTMLElement[]) {
        el.style.transition = "";
        el.style.opacity = "";
      }
    }, FADE_MS);
  }
}

function show() {
  if (active) return;
  active = true;

  x = Math.random() * (window.innerWidth - FACE_SIZE);
  y = Math.random() * (window.innerHeight - FACE_SIZE);
  dx = Math.random() > 0.5 ? SPEED : -SPEED;
  dy = Math.random() > 0.5 ? SPEED : -SPEED;

  overlay.style.pointerEvents = "auto";
  overlay.style.cursor = "none";
  overlay.style.opacity = "1";
  fadeUI(true);

  animFrame = requestAnimationFrame(tick);
}

function hide() {
  if (!active) return;
  active = false;

  cancelAnimationFrame(animFrame);
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
  overlay.style.cursor = "";
  fadeUI(false);

  resetTimer();
}

function tick() {
  const maxX = window.innerWidth - FACE_SIZE;
  const maxY = window.innerHeight - FACE_SIZE;

  x += dx;
  y += dy;

  if (x <= 0) {
    x = 0;
    dx = SPEED;
  } else if (x >= maxX) {
    x = maxX;
    dx = -SPEED;
  }

  if (y <= 0) {
    y = 0;
    dy = SPEED;
  } else if (y >= maxY) {
    y = maxY;
    dy = -SPEED;
  }

  logo.style.transform = `translate(${x}px, ${y}px)`;
  animFrame = requestAnimationFrame(tick);
}

function resetTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(show, IDLE_TIMEOUT);
}

function onActivity() {
  if (active) {
    hide();
  } else {
    resetTimer();
  }
}

export function initScreensaver() {
  createOverlay();

  const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
  for (const evt of events) {
    document.addEventListener(evt, onActivity, { passive: true });
  }

  resetTimer();
}
