import type { CustomRenderer } from "./window-manager";
import { track } from "./analytics";

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

interface Toy {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
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
  targetX: number | null;
}

type AnimState = "idle" | "walk" | "pet";

interface PetStats {
  cal: { clicks: number; treats: number };
  weez: { clicks: number; treats: number };
}

// ── Config ───────────────────────────────────────────────

const FRAME_SIZE = 64;
const GROUND_OFFSET = 20;
const WALK_SPEED = 1.5;
const PET_DURATION = 1200;
const HEART_SIZE = 24;
const HEART_LIFETIME = 1000;
const HEART_RISE_SPEED = 0.4;
const TOY_GRAVITY = 0.3;
const BONE_SCALE = 1.25;
const BONE_SIZE = FRAME_SIZE * BONE_SCALE;
const MOUSE_SCALE = 0.75;
const MOUSE_SIZE = FRAME_SIZE * MOUSE_SCALE;
const COOLDOWN = 10000;

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
    scale: 2.25,
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

function trackAction(petName: string, action: "click" | "treat") {
  fetch("/api/pets/clicks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ petName, action }),
  });
  track("pet_interacted", { pet_name: petName, action });
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
  p.targetX = null;
}

function toWalk(p: Pet) {
  p.state = "walk";
  resetAnim(p);
  p.dir = Math.random() > 0.5 ? 1 : -1;
  p.walkTimer = 0;
  p.walkDuration = 1500 + Math.random() * 2500;
  p.targetX = null;
}

function toPet(p: Pet) {
  p.state = "pet";
  resetAnim(p);
  p.petTimer = 0;
  p.targetX = null;
}

// ── Renderer ────────────────────────────────────────────

export const petsRenderer: CustomRenderer = {
  populate(body) {
    body.classList.add("pets-view");

    const canvas = document.createElement("canvas");
    canvas.className = "pets-canvas";
    body.appendChild(canvas);

    // Toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "pets-toolbar";
    body.appendChild(toolbar);

    const makeToyBtn = (id: string, emoji: string) => {
      const btn = document.createElement("button");
      btn.className = "window-btn pets-toy-btn";
      btn.dataset[id] = "";
      btn.textContent = emoji;
      toolbar.appendChild(btn);
      return btn;
    };

    makeToyBtn("boneBtn", "🦴");
    makeToyBtn("mouseBtn", "🐭");

    // Stats
    const statsEl = document.createElement("div");
    statsEl.className = "pets-stats";
    body.appendChild(statsEl);

    const makeStatCol = (name: string, dataPrefix: string) => {
      const col = document.createElement("div");
      col.className = "pets-stat-col";
      const label = document.createElement("span");
      label.className = "pets-stat-name";
      label.textContent = name;
      col.appendChild(label);
      const pets = document.createElement("span");
      pets.dataset[dataPrefix + "Pets"] = "";
      pets.textContent = "— pets";
      col.appendChild(pets);
      const treats = document.createElement("span");
      treats.dataset[dataPrefix + "Treats"] = "";
      treats.textContent = "— treats";
      col.appendChild(treats);
      statsEl.appendChild(col);
    };

    makeStatCol("cal", "statsCal");
    makeStatCol("weez", "statsWeez");

    // Cooldown bars
    const barWrap = document.createElement("div");
    barWrap.className = "pets-bar-wrap";
    body.appendChild(barWrap);

    const calBar = document.createElement("div");
    calBar.className = "pets-bar pets-bar--cal";
    calBar.dataset.barCal = "";
    barWrap.appendChild(calBar);

    const weezBar = document.createElement("div");
    weezBar.className = "pets-bar pets-bar--weez";
    weezBar.dataset.barWeez = "";
    barWrap.appendChild(weezBar);
  },

  async onReady(state) {
    const canvas = state.body.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const heartImg = await loadImage("/sprites/heart.png");
    const boneImg = await loadImage("/sprites/bone.png");
    const mouseImg = await loadImage("/sprites/mouse.png");

    // ── Stats ──────────────────────────────────────────
    const stats: PetStats = {
      cal: { clicks: 0, treats: 0 },
      weez: { clicks: 0, treats: 0 },
    };

    const calPetsEl = state.body.querySelector("[data-stats-cal-pets]") as HTMLElement;
    const calTreatsEl = state.body.querySelector("[data-stats-cal-treats]") as HTMLElement;
    const weezPetsEl = state.body.querySelector("[data-stats-weez-pets]") as HTMLElement;
    const weezTreatsEl = state.body.querySelector("[data-stats-weez-treats]") as HTMLElement;
    const calBarEl = state.body.querySelector("[data-bar-cal]") as HTMLElement;
    const weezBarEl = state.body.querySelector("[data-bar-weez]") as HTMLElement;

    function updateStatsDisplay() {
      calPetsEl.textContent = `${stats.cal.clicks} pets`;
      calTreatsEl.textContent = `${stats.cal.treats} treats`;
      weezPetsEl.textContent = `${stats.weez.clicks} pets`;
      weezTreatsEl.textContent = `${stats.weez.treats} treats`;
    }

    fetch("/api/pets/clicks")
      .then((r) => r.json())
      .then((rows: { petName: string; clicks: number; treats: number }[]) => {
        for (const row of rows) {
          if (row.petName === "cal" || row.petName === "weez") {
            stats[row.petName] = { clicks: row.clicks, treats: row.treats };
          }
        }
        updateStatsDisplay();
      })
      .catch(() => {});

    // Load all pets
    const pets: Pet[] = await Promise.all(
      PET_CONFIGS.map(async (cfg) => {
        const anims = await loadPetAnims(cfg);
        const pet: Pet = {
          name: cfg.name, scale: cfg.scale, anims,
          state: "idle", dir: 1, frame: 0, frameTick: 0,
          x: 0, walkTimer: 0, walkDuration: 0, petTimer: 0,
          idleTimer: 2000 + Math.random() * 4000, targetX: null,
        };
        return pet;
      })
    );

    const drawOrder = [...pets].sort((a, b) => b.scale - a.scale);

    const hearts: Heart[] = [];
    let bone: Toy | null = null;
    let mouse: Toy | null = null;
    let viewW = 0;
    let viewH = 0;
    let raf = 0;
    let lastTime = 0;

    // ── Unified cooldowns ──────────────────────────────
    let calCooldownEnd = 0;
    let weezCooldownEnd = 0;

    function isOnCooldown(petName: string): boolean {
      const now = performance.now();
      return petName === "cal" ? now < calCooldownEnd : now < weezCooldownEnd;
    }

    function startCooldown(petName: string) {
      const end = performance.now() + COOLDOWN;
      if (petName === "cal") calCooldownEnd = end;
      else weezCooldownEnd = end;
    }

    const boneBtn = state.body.querySelector("[data-bone-btn]") as HTMLButtonElement;
    const mouseBtn = state.body.querySelector("[data-mouse-btn]") as HTMLButtonElement;

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
      const hit = hitTest(e.clientX, e.clientY);
      canvas.style.cursor = hit && !isOnCooldown(hit.name) ? "grab" : "";
    });

    canvas.addEventListener("click", (e) => {
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit || isOnCooldown(hit.name)) return;

      startCooldown(hit.name);
      const savedTarget = hit.targetX;
      toPet(hit);
      hit.targetX = savedTarget;
      const size = drawSize(hit);
      hearts.push({
        x: hit.x + size / 2 + (Math.random() - 0.5) * 20,
        y: petY(hit) - 10,
        opacity: 1,
        age: 0,
      });

      if (hit.name === "cal" || hit.name === "weez") {
        stats[hit.name].clicks++;
        updateStatsDisplay();
        trackAction(hit.name, "click");
      }
    });

    // ── Toy buttons ─────────────────────────────────────

    boneBtn.addEventListener("click", () => {
      if (bone || isOnCooldown("cal")) return;
      startCooldown("cal");
      const margin = BONE_SIZE;
      bone = {
        x: margin + Math.random() * (viewW - margin * 2),
        y: -BONE_SIZE,
        vy: 0,
        grounded: false,
      };
    });

    mouseBtn.addEventListener("click", () => {
      if (mouse || isOnCooldown("weez")) return;
      startCooldown("weez");
      const margin = MOUSE_SIZE;
      mouse = {
        x: margin + Math.random() * (viewW - margin * 2),
        y: -MOUSE_SIZE,
        vy: 0,
        grounded: false,
      };
    });

    // ── Loop ───────────────────────────────────────────

    function update(dt: number) {
      // Update cooldown bars + button states
      const now = performance.now();
      const calRemain = Math.max(0, calCooldownEnd - now);
      const weezRemain = Math.max(0, weezCooldownEnd - now);
      calBarEl.style.width = `${(calRemain / COOLDOWN) * 100}%`;
      weezBarEl.style.width = `${(weezRemain / COOLDOWN) * 100}%`;

      const calCd = calRemain > 0;
      const weezCd = weezRemain > 0;
      boneBtn.style.opacity = calCd ? "0.4" : "1";
      boneBtn.style.pointerEvents = calCd ? "none" : "auto";
      mouseBtn.style.opacity = weezCd ? "0.4" : "1";
      mouseBtn.style.pointerEvents = weezCd ? "none" : "auto";

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
          if (p.targetX !== null) {
            const calCenter = p.x + drawSize(p) / 2;
            const targetCenter = p.targetX + drawSize(p) / 2;
            p.dir = targetCenter > calCenter ? 1 : -1;
          } else {
            p.walkTimer += dt;
            if (p.walkTimer >= p.walkDuration) toIdle(p);
          }
        } else if (p.state === "pet") {
          p.petTimer += dt;
          if (p.petTimer >= PET_DURATION) {
            if (p.targetX !== null) {
              const savedTarget = p.targetX;
              const petCenter = p.x + drawSize(p) / 2;
              const targetCenter = savedTarget + drawSize(p) / 2;
              p.state = "walk";
              resetAnim(p);
              p.targetX = savedTarget;
              p.dir = targetCenter > petCenter ? 1 : -1;
            } else {
              toIdle(p);
            }
          }
        } else {
          p.idleTimer -= dt;
          if (p.idleTimer <= 0) toWalk(p);
        }
      }

      // ── Toy physics ───────────────────────────────────
      function updateToy(toy: Toy, toySize: number, petName: string): Toy | null {
        const groundY = viewH - toySize - GROUND_OFFSET;
        if (!toy.grounded) {
          toy.vy += TOY_GRAVITY * (dt / 16);
          toy.y += toy.vy * (dt / 16);
          if (toy.y >= groundY) {
            toy.y = groundY;
            toy.grounded = true;
            const pet = pets.find((p) => p.name === petName);
            if (pet) {
              const petCenter = pet.x + drawSize(pet) / 2;
              const toyCenter = toy.x + toySize / 2;
              pet.targetX = toyCenter - drawSize(pet) / 2;
              pet.dir = toyCenter > petCenter ? 1 : -1;
              pet.state = "walk";
              resetAnim(pet);
            }
          }
        } else {
          const pet = pets.find((p) => p.name === petName);
          if (pet && pet.targetX !== null) {
            const dist = Math.abs(pet.x - pet.targetX);
            if (dist < 4) {
              pet.targetX = null;
              toPet(pet);
              const size = drawSize(pet);
              hearts.push({
                x: pet.x + size / 2 + (Math.random() - 0.5) * 20,
                y: petY(pet) - 10,
                opacity: 1,
                age: 0,
              });
              if (petName === "cal" || petName === "weez") {
                stats[petName].treats++;
                updateStatsDisplay();
                trackAction(petName, "treat");
              }
              return null;
            }
          }
        }
        return toy;
      }

      if (bone) bone = updateToy(bone, BONE_SIZE, "cal");
      if (mouse) mouse = updateToy(mouse, MOUSE_SIZE, "weez");

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

      if (bone) {
        ctx.drawImage(boneImg, 0, 0, FRAME_SIZE, FRAME_SIZE, bone.x, bone.y, BONE_SIZE, BONE_SIZE);
      }
      if (mouse) {
        ctx.drawImage(mouseImg, 0, 0, FRAME_SIZE, FRAME_SIZE, mouse.x, mouse.y, MOUSE_SIZE, MOUSE_SIZE);
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

    new MutationObserver((_, obs) => {
      if (!document.contains(canvas)) {
        cancelAnimationFrame(raf);
        ro.disconnect();
        obs.disconnect();
      }
    }).observe(document.body, { childList: true, subtree: true });
  },
};
