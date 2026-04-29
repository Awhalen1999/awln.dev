import type { CustomRenderer } from "./window-manager";

const FRAME_SIZE = 64;
const WALK_SPEED = 1.5;
const GROUND_OFFSET = 20;
const HEART_SIZE = 24;

interface Anim {
  img: HTMLImageElement;
  frames: number;
  durations: number[];
}

type AnimState = "idle" | "walk" | "pet";
type Dir = 1 | -1;

interface PetConfig {
  name: string;
  scale: number;
  sheets: { idle: string; walk: string; pet: string };
  idleDurations: number[];
  walkDurations: number[];
  petDurations: number[];
  idleFrames: number;
  walkFrames: number;
  petFrames: number;
}

interface Pet {
  config: PetConfig;
  anims: Record<AnimState, Anim>;
  state: AnimState;
  dir: Dir;
  frame: number;
  frameTick: number;
  x: number;
  walkTimer: number;
  walkDuration: number;
  petTimer: number;
  idleTimer: number;
  drawW: number;
  drawH: number;
}

const PETS: PetConfig[] = [
  {
    name: "cal",
    scale: 2,
    sheets: { idle: "/sprites/cal_idle.png", walk: "/sprites/cal_walk.png", pet: "/sprites/cal_pet.png" },
    idleDurations: [1500, 250],
    walkDurations: [250, 250],
    petDurations: [1200],
    idleFrames: 2,
    walkFrames: 2,
    petFrames: 1,
  },
  {
    name: "weez",
    scale: 1.5,
    sheets: { idle: "/sprites/weez_idle.png", walk: "/sprites/weez_walk.png", pet: "/sprites/weez_pet.png" },
    idleDurations: [1500, 200],
    walkDurations: [250, 250],
    petDurations: [1200],
    idleFrames: 2,
    walkFrames: 2,
    petFrames: 1,
  },
];

function loadSheet(src: string, frameCount: number, durations: number[]): Promise<Anim> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, frames: frameCount, durations });
    img.src = src;
  });
}

function createPet(config: PetConfig, anims: Record<AnimState, Anim>): Pet {
  return {
    config,
    anims,
    state: "idle",
    dir: 1,
    frame: 0,
    frameTick: 0,
    x: 0,
    walkTimer: 0,
    walkDuration: 0,
    petTimer: 0,
    idleTimer: 2000 + Math.random() * 4000,
    drawW: FRAME_SIZE * config.scale,
    drawH: FRAME_SIZE * config.scale,
  };
}

function startWalk(p: Pet) {
  p.state = "walk";
  p.dir = Math.random() > 0.5 ? 1 : -1;
  p.frame = 0;
  p.frameTick = 0;
  p.walkTimer = 0;
  p.walkDuration = 1500 + Math.random() * 2500;
}

function startIdle(p: Pet) {
  p.state = "idle";
  p.frame = 0;
  p.frameTick = 0;
  p.idleTimer = 2000 + Math.random() * 4000;
}

function startPetAnim(p: Pet) {
  p.state = "pet";
  p.frame = 0;
  p.frameTick = 0;
  p.petTimer = 0;
}

interface Heart {
  x: number;
  y: number;
  opacity: number;
  age: number;
}

export const petsRenderer: CustomRenderer = {
  populate(body) {
    body.style.padding = "0";
    body.style.overflow = "hidden";
    body.style.background = "url(/wallpapers/wallpaper4.png) center / cover no-repeat";
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.imageRendering = "pixelated";
    canvas.style.cursor = "default";
    body.appendChild(canvas);
  },

  onReady(state) {
    const canvas = state.body.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    let pets: Pet[] = [];
    let raf = 0;
    let lastTime = 0;
    const hearts: Heart[] = [];

    let heartImg: HTMLImageElement | null = null;
    const hImg = new Image();
    hImg.onload = () => { heartImg = hImg; };
    hImg.src = "/sprites/heart.png";

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }

    function getY(p: Pet) {
      return canvas.getBoundingClientRect().height - p.drawH - GROUND_OFFSET;
    }

    function hitTest(clientX: number, clientY: number): Pet | null {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      // test in reverse draw order (front pets first)
      for (let i = pets.length - 1; i >= 0; i--) {
        const p = pets[i];
        const py = getY(p);
        if (mx >= p.x && mx <= p.x + p.drawW && my >= py && my <= py + p.drawH) {
          return p;
        }
      }
      return null;
    }

    canvas.addEventListener("mousemove", (e) => {
      canvas.style.cursor = hitTest(e.clientX, e.clientY) ? "pointer" : "default";
    });

    canvas.addEventListener("click", (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (hit) {
        startPetAnim(hit);
        hearts.push({
          x: hit.x + hit.drawW / 2 + (Math.random() - 0.5) * 20,
          y: getY(hit) - 10,
          opacity: 1,
          age: 0,
        });
      }
    });

    canvas.addEventListener("mouseleave", () => {
      canvas.style.cursor = "default";
    });

    function updatePet(p: Pet, dt: number) {
      const anim = p.anims[p.state];
      p.frameTick += dt;
      if (p.frameTick >= anim.durations[p.frame]) {
        p.frameTick -= anim.durations[p.frame];
        p.frame = (p.frame + 1) % anim.frames;
      }

      if (p.state === "walk") {
        p.x += WALK_SPEED * p.dir * (dt / 16);
        const maxX = canvas.getBoundingClientRect().width - p.drawW;
        if (p.x <= 0) { p.x = 0; p.dir = 1; }
        if (p.x >= maxX) { p.x = maxX; p.dir = -1; }
        p.walkTimer += dt;
        if (p.walkTimer >= p.walkDuration) startIdle(p);
      } else if (p.state === "pet") {
        p.petTimer += dt;
        if (p.petTimer >= 1200) startIdle(p);
      } else {
        p.idleTimer -= dt;
        if (p.idleTimer <= 0) startWalk(p);
      }
    }

    function drawPet(p: Pet) {
      const anim = p.anims[p.state];
      const y = getY(p);

      ctx.save();
      if (p.dir === -1 && p.state === "walk") {
        ctx.translate(p.x + p.drawW, y);
        ctx.scale(-1, 1);
        ctx.drawImage(anim.img, p.frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, 0, 0, p.drawW, p.drawH);
      } else {
        ctx.drawImage(anim.img, p.frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, p.x, y, p.drawW, p.drawH);
      }
      ctx.restore();
    }

    function loop(time: number) {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      resize();

      for (const p of pets) updatePet(p, dt);

      // update hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.age += dt;
        h.y -= 0.4 * (dt / 16);
        h.opacity = Math.max(0, 1 - h.age / 1000);
        if (h.opacity <= 0) hearts.splice(i, 1);
      }

      // draw — larger pets (further back) first, smaller in front
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const sorted = [...pets].sort((a, b) => b.config.scale - a.config.scale);
      for (const p of sorted) drawPet(p);

      if (heartImg) {
        for (const h of hearts) {
          ctx.save();
          ctx.globalAlpha = h.opacity;
          ctx.drawImage(heartImg, h.x - HEART_SIZE / 2, h.y - HEART_SIZE / 2, HEART_SIZE, HEART_SIZE);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(loop);
    }

    // load all pets
    Promise.all(
      PETS.map((cfg) =>
        Promise.all([
          loadSheet(cfg.sheets.idle, cfg.idleFrames, cfg.idleDurations),
          loadSheet(cfg.sheets.walk, cfg.walkFrames, cfg.walkDurations),
          loadSheet(cfg.sheets.pet, cfg.petFrames, cfg.petDurations),
        ]).then(([idle, walk, pet]) => createPet(cfg, { idle, walk, pet }))
      )
    ).then((loaded) => {
      pets = loaded;
      resize();
      const cw = canvas.getBoundingClientRect().width;
      // spread pets across the window
      pets.forEach((p, i) => {
        p.x = (cw / (pets.length + 1)) * (i + 1) - p.drawW / 2;
      });
      raf = requestAnimationFrame(loop);
    });

    const observer = new MutationObserver(() => {
      if (!document.contains(canvas)) {
        cancelAnimationFrame(raf);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
