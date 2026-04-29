import type { CustomRenderer } from "./window-manager";

// ── Types ────────────────────────────────────────────────

interface Anim {
  img: HTMLImageElement;
  frames: number;
  durations: number[];
}

interface Heart {
  x: number;
  y: number;
  opacity: number;
  age: number;
}

interface Pet {
  name: string;
  scale: number;
  anims: Record<AnimState, Anim>;
  state: AnimState;
  dir: 1 | -1;
  frame: number;
  frameTick: number;
  x: number;
  walkTimer: number;
  walkDuration: number;
  petTimer: number;
  idleTimer: number;
}

type AnimState = "idle" | "walk" | "pet";

// ── Config ───────────────────────────────────────────────

const FRAME_SIZE = 64;
const GROUND_OFFSET = 20;
const WALK_SPEED = 1.5;
const PET_DURATION = 1200;
const HEART_SIZE = 24;
const HEART_LIFETIME = 1000;
const HEART_RISE_SPEED = 0.4;

interface AnimConfig {
  src: string;
  frames: number;
  durations: number[];
}

interface PetConfig {
  name: string;
  scale: number;
  anims: Record<AnimState, AnimConfig>;
}

const PET_CONFIGS: PetConfig[] = [
  {
    name: "cal",
    scale: 2,
    anims: {
      idle: { src: "/sprites/cal_idle.png", frames: 2, durations: [1500, 250] },
      walk: { src: "/sprites/cal_walk.png", frames: 2, durations: [250, 250] },
      pet:  { src: "/sprites/cal_pet.png",  frames: 1, durations: [PET_DURATION] },
    },
  },
  {
    name: "weez",
    scale: 1.5,
    anims: {
      idle: { src: "/sprites/weez_idle.png", frames: 2, durations: [1500, 200] },
      walk: { src: "/sprites/weez_walk.png", frames: 2, durations: [250, 250] },
      pet:  { src: "/sprites/weez_pet.png",  frames: 1, durations: [PET_DURATION] },
    },
  },
];

// ── Helpers ──────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

async function loadPetAnims(cfg: PetConfig): Promise<Record<AnimState, Anim>> {
  const keys = Object.keys(cfg.anims) as AnimState[];
  const entries = await Promise.all(
    keys.map(async (key) => {
      const ac = cfg.anims[key];
      const img = await loadImage(ac.src);
      return [key, { img, frames: ac.frames, durations: ac.durations }] as const;
    })
  );
  return Object.fromEntries(entries) as Record<AnimState, Anim>;
}

function drawSize(pet: Pet) {
  return FRAME_SIZE * pet.scale;
}

// ── State transitions ───────────────────────────────────

function resetAnim(p: Pet) {
  p.frame = 0;
  p.frameTick = 0;
}

function toIdle(p: Pet) {
  p.state = "idle";
  resetAnim(p);
  p.idleTimer = 2000 + Math.random() * 4000;
}

function toWalk(p: Pet) {
  p.state = "walk";
  resetAnim(p);
  p.dir = Math.random() > 0.5 ? 1 : -1;
  p.walkTimer = 0;
  p.walkDuration = 1500 + Math.random() * 2500;
}

function toPet(p: Pet) {
  p.state = "pet";
  resetAnim(p);
  p.petTimer = 0;
}

// ── Renderer ────────────────────────────────────────────

export const petsRenderer: CustomRenderer = {
  populate(body) {
    body.style.padding = "0";
    body.style.overflow = "hidden";
    body.style.background = "url(/pets_background.png) center / cover no-repeat";

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block;image-rendering:pixelated";
    body.appendChild(canvas);
  },

  async onReady(state) {
    const canvas = state.body.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const heartImg = await loadImage("/sprites/heart.png");

    // Load all pets
    const pets: Pet[] = await Promise.all(
      PET_CONFIGS.map(async (cfg) => {
        const anims = await loadPetAnims(cfg);
        const pet: Pet = {
          name: cfg.name, scale: cfg.scale, anims,
          state: "idle", dir: 1, frame: 0, frameTick: 0,
          x: 0, walkTimer: 0, walkDuration: 0, petTimer: 0,
          idleTimer: 2000 + Math.random() * 4000,
        };
        return pet;
      })
    );

    // Draw order: larger pets behind, smaller in front
    const drawOrder = [...pets].sort((a, b) => b.scale - a.scale);

    const hearts: Heart[] = [];
    let viewW = 0;
    let viewH = 0;
    let raf = 0;
    let lastTime = 0;

    function syncSize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      viewW = rect.width;
      viewH = rect.height;
      canvas.width = viewW * dpr;
      canvas.height = viewH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    function petY(p: Pet) {
      return viewH - drawSize(p) - GROUND_OFFSET;
    }

    function hitTest(cx: number, cy: number): Pet | null {
      const rect = canvas.getBoundingClientRect();
      const mx = cx - rect.left;
      const my = cy - rect.top;
      for (let i = drawOrder.length - 1; i >= 0; i--) {
        const p = drawOrder[i];
        const size = drawSize(p);
        const py = petY(p);
        if (mx >= p.x && mx <= p.x + size && my >= py && my <= py + size) return p;
      }
      return null;
    }

    // ── Input ──────────────────────────────────────────

    canvas.addEventListener("mousemove", (e) => {
      canvas.style.cursor = hitTest(e.clientX, e.clientY) ? "grab" : "";
    });

    canvas.addEventListener("click", (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      toPet(hit);
      const size = drawSize(hit);
      hearts.push({
        x: hit.x + size / 2 + (Math.random() - 0.5) * 20,
        y: petY(hit) - 10,
        opacity: 1,
        age: 0,
      });
    });

    // ── Loop ───────────────────────────────────────────

    function update(dt: number) {
      for (const p of pets) {
        const anim = p.anims[p.state];
        p.frameTick += dt;
        if (p.frameTick >= anim.durations[p.frame]) {
          p.frameTick -= anim.durations[p.frame];
          p.frame = (p.frame + 1) % anim.frames;
        }

        if (p.state === "walk") {
          p.x += WALK_SPEED * p.dir * (dt / 16);
          const maxX = viewW - drawSize(p);
          if (p.x <= 0) { p.x = 0; p.dir = 1; }
          if (p.x >= maxX) { p.x = maxX; p.dir = -1; }
          p.walkTimer += dt;
          if (p.walkTimer >= p.walkDuration) toIdle(p);
        } else if (p.state === "pet") {
          p.petTimer += dt;
          if (p.petTimer >= PET_DURATION) toIdle(p);
        } else {
          p.idleTimer -= dt;
          if (p.idleTimer <= 0) toWalk(p);
        }
      }

      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.age += dt;
        h.y -= HEART_RISE_SPEED * (dt / 16);
        h.opacity = Math.max(0, 1 - h.age / HEART_LIFETIME);
        if (h.opacity <= 0) hearts.splice(i, 1);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, viewW, viewH);

      for (const p of drawOrder) {
        const anim = p.anims[p.state];
        const size = drawSize(p);
        const y = petY(p);

        ctx.save();
        if (p.dir === -1 && p.state === "walk") {
          ctx.translate(p.x + size, y);
          ctx.scale(-1, 1);
          ctx.drawImage(anim.img, p.frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, 0, 0, size, size);
        } else {
          ctx.drawImage(anim.img, p.frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, p.x, y, size, size);
        }
        ctx.restore();
      }

      for (const h of hearts) {
        ctx.save();
        ctx.globalAlpha = h.opacity;
        ctx.drawImage(heartImg, h.x - HEART_SIZE / 2, h.y - HEART_SIZE / 2, HEART_SIZE, HEART_SIZE);
        ctx.restore();
      }
    }

    function loop(time: number) {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    // ── Init ───────────────────────────────────────────

    syncSize();
    pets.forEach((p, i) => {
      p.x = (viewW / (pets.length + 1)) * (i + 1) - drawSize(p) / 2;
    });

    const ro = new ResizeObserver(() => syncSize());
    ro.observe(canvas);

    raf = requestAnimationFrame(loop);

    // Cleanup when window is closed
    new MutationObserver((_, obs) => {
      if (!document.contains(canvas)) {
        cancelAnimationFrame(raf);
        ro.disconnect();
        obs.disconnect();
      }
    }).observe(document.body, { childList: true, subtree: true });
  },
};
