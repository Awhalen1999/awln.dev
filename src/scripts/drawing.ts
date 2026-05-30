import { $accent, $theme } from "../stores/settings";

const BRUSH_SIZE = 16;
const BRUSH_ALPHA = 0.12;
const DAB_STEP = 2;

let root: HTMLElement | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let buffer: HTMLCanvasElement | null = null;
let bufferCtx: CanvasRenderingContext2D | null = null;
let dpr = 1;

let drawing = false;
let lastX = 0;
let lastY = 0;

function readAccent(): string {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
}

function resize() {
  if (!canvas || !ctx || !buffer || !bufferCtx) return;
  const rect = canvas.getBoundingClientRect();
  const newDpr = window.devicePixelRatio || 1;
  const newW = Math.round(rect.width * newDpr);
  const newH = Math.round(rect.height * newDpr);
  if (newW === canvas.width && newH === canvas.height) return;

  const prev = document.createElement("canvas");
  prev.width = buffer.width;
  prev.height = buffer.height;
  prev.getContext("2d")!.drawImage(buffer, 0, 0);

  dpr = newDpr;
  canvas.width = newW;
  canvas.height = newH;
  buffer.width = newW;
  buffer.height = newH;
  bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
  bufferCtx.drawImage(prev, 0, 0);
  bufferCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}

function dab(x: number, y: number) {
  if (!bufferCtx) return;
  bufferCtx.globalAlpha = BRUSH_ALPHA;
  bufferCtx.fillStyle = "#000";
  bufferCtx.beginPath();
  bufferCtx.arc(x, y, BRUSH_SIZE / 2, 0, Math.PI * 2);
  bufferCtx.fill();
}

function stamp(x: number, y: number) {
  const dx = x - lastX;
  const dy = y - lastY;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / DAB_STEP));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    dab(lastX + dx * t, lastY + dy * t);
  }
  lastX = x;
  lastY = y;
}

function render() {
  if (!ctx || !canvas || !buffer) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = readAccent();
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(buffer, 0, 0);
  ctx.restore();
}

function localCoords(e: PointerEvent): [number, number] {
  const rect = canvas!.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}

function onPointerDown(e: PointerEvent) {
  if (!canvas) return;
  drawing = true;
  canvas.setPointerCapture(e.pointerId);
  [lastX, lastY] = localCoords(e);
  dab(lastX, lastY);
  render();
}

function onPointerMove(e: PointerEvent) {
  if (!drawing) return;
  const [x, y] = localCoords(e);
  stamp(x, y);
  render();
}

function onPointerUp(e: PointerEvent) {
  drawing = false;
  canvas?.releasePointerCapture(e.pointerId);
}

export function clearDrawings() {
  if (!bufferCtx || !buffer) return;
  bufferCtx.save();
  bufferCtx.setTransform(1, 0, 0, 1, 0, 0);
  bufferCtx.clearRect(0, 0, buffer.width, buffer.height);
  bufferCtx.restore();
  render();
}

export function isPenActive(): boolean {
  return root?.hasAttribute("data-pen-active") ?? false;
}

export function togglePen(): boolean {
  if (!root) return false;
  const next = !isPenActive();
  if (next) root.setAttribute("data-pen-active", "");
  else root.removeAttribute("data-pen-active");
  return next;
}

export function initDrawing() {
  root = document.querySelector<HTMLElement>("[data-desktop]");
  canvas = document.querySelector<HTMLCanvasElement>("[data-draw-canvas]");
  if (!root || !canvas) return;
  ctx = canvas.getContext("2d");
  if (!ctx) return;

  buffer = document.createElement("canvas");
  bufferCtx = buffer.getContext("2d");
  if (!bufferCtx) return;

  resize();
  new ResizeObserver(() => resize()).observe(canvas);

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  $accent.subscribe(() => render());
  $theme.subscribe(() => render());
}
