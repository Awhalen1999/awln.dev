import type { CustomRenderer } from "./window-manager";

const FRAME_W = 32;
const FRAME_H = 32;
const SCALE = 3.25;
const DRAW_W = FRAME_W * SCALE;
const DRAW_H = FRAME_H * SCALE;
const WALK_SPEED = 1.5; // px per tick
const GROUND_OFFSET = 20; // px from bottom

interface Anim {
  img: HTMLImageElement;
  frames: number;
  durations: number[];
}

type State = "idle" | "walk";
type Dir = 1 | -1; // 1 = right, -1 = left

function loadSheet(src: string, frameCount: number, durations: number[]): Promise<Anim> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, frames: frameCount, durations });
    img.src = src;
  });
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
    body.appendChild(canvas);
  },

  onReady(state) {
    const canvas = state.body.querySelector("canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    let anims: Record<State, Anim>;
    let currentState: State = "idle";
    let dir: Dir = 1;
    let frame = 0;
    let frameTick = 0;
    let x = 0;
    let walkTimer = 0;
    let walkDuration = 0;
    let raf = 0;
    let lastTime = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      if (x === 0) x = (rect.width - DRAW_W) / 2;
    }

    function startWalk() {
      currentState = "walk";
      dir = Math.random() > 0.5 ? 1 : -1;
      frame = 0;
      frameTick = 0;
      walkTimer = 0;
      walkDuration = 1500 + Math.random() * 2500;
    }

    function startIdle() {
      currentState = "idle";
      frame = 0;
      frameTick = 0;
    }

    let idleTimer = 2000 + Math.random() * 4000;

    function update(dt: number) {
      const anim = anims[currentState];

      // advance frame
      frameTick += dt;
      if (frameTick >= anim.durations[frame]) {
        frameTick -= anim.durations[frame];
        frame = (frame + 1) % anim.frames;
      }

      if (currentState === "walk") {
        x += WALK_SPEED * dir * (dt / 16);
        const maxX = canvas.getBoundingClientRect().width - DRAW_W;
        if (x <= 0) { x = 0; dir = 1; }
        if (x >= maxX) { x = maxX; dir = -1; }

        walkTimer += dt;
        if (walkTimer >= walkDuration) {
          startIdle();
          idleTimer = 2000 + Math.random() * 4000;
        }
      } else {
        idleTimer -= dt;
        if (idleTimer <= 0) startWalk();
      }
    }

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const anim = anims[currentState];
      const y = rect.height - DRAW_H - GROUND_OFFSET;

      ctx.save();
      if (dir === -1) {
        ctx.translate(x + DRAW_W, y);
        ctx.scale(-1, 1);
        ctx.drawImage(anim.img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, DRAW_W, DRAW_H);
      } else {
        ctx.drawImage(anim.img, frame * FRAME_W, 0, FRAME_W, FRAME_H, x, y, DRAW_W, DRAW_H);
      }
      ctx.restore();
    }

    function loop(time: number) {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      resize();
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    Promise.all([
      loadSheet("/sprites/cal_idle.png", 2, [1500, 200]),
      loadSheet("/sprites/cal_walk.png", 2, [200, 200]),
    ]).then(([idle, walk]) => {
      anims = { idle, walk };
      resize();
      x = (canvas.getBoundingClientRect().width - DRAW_W) / 2;
      raf = requestAnimationFrame(loop);
    });

    // cleanup when window is removed
    const observer = new MutationObserver(() => {
      if (!document.contains(canvas)) {
        cancelAnimationFrame(raf);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  },
};
