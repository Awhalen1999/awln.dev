import type { CustomRenderer } from "./window-manager";

const FRAME_W = 64;
const FRAME_H = 64;
const SCALE = 2;
const DRAW_W = FRAME_W * SCALE;
const DRAW_H = FRAME_H * SCALE;
const WALK_SPEED = 1.5;
const GROUND_OFFSET = 20;

interface Anim {
  img: HTMLImageElement;
  frames: number;
  durations: number[];
}

type State = "idle" | "walk" | "pet";
type Dir = 1 | -1;

function loadSheet(src: string, frameCount: number, durations: number[]): Promise<Anim> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, frames: frameCount, durations });
    img.src = src;
  });
}

const HEART_SIZE = 24; // rendered size

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

    let anims: Record<State, Anim>;
    let currentState: State = "idle";
    let dir: Dir = 1;
    let frame = 0;
    let frameTick = 0;
    let x = 0;
    let walkTimer = 0;
    let walkDuration = 0;
    let petTimer = 0;
    let raf = 0;
    let lastTime = 0;
    let idleTimer = 2000 + Math.random() * 4000;
    const hearts: Heart[] = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      if (x === 0) x = (rect.width - DRAW_W) / 2;
    }

    function getY() {
      return canvas.getBoundingClientRect().height - DRAW_H - GROUND_OFFSET;
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
      idleTimer = 2000 + Math.random() * 4000;
    }

    function startPet() {
      currentState = "pet";
      frame = 0;
      frameTick = 0;
      petTimer = 0;
      // spawn a heart
      hearts.push({
        x: x + DRAW_W / 2 + (Math.random() - 0.5) * 20,
        y: getY() - 10,
        opacity: 1,
        age: 0,
      });
    }

    function isHit(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const py = getY();
      return mx >= x && mx <= x + DRAW_W && my >= py && my <= py + DRAW_H;
    }

    canvas.addEventListener("mousemove", (e) => {
      canvas.style.cursor = isHit(e.clientX, e.clientY) ? "pointer" : "default";
    });

    canvas.addEventListener("click", (e) => {
      if (!anims) return;
      if (isHit(e.clientX, e.clientY)) startPet();
    });

    canvas.addEventListener("mouseleave", () => {
      canvas.style.cursor = "default";
    });

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
        if (walkTimer >= walkDuration) startIdle();
      } else if (currentState === "pet") {
        petTimer += dt;
        if (petTimer >= 1200) startIdle();
      } else {
        idleTimer -= dt;
        if (idleTimer <= 0) startWalk();
      }

      // update hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.age += dt;
        h.y -= 0.4 * (dt / 16);
        h.opacity = Math.max(0, 1 - h.age / 1000);
        if (h.opacity <= 0) hearts.splice(i, 1);
      }
    }

    let heartImg: HTMLImageElement | null = null;
    const hImg = new Image();
    hImg.onload = () => { heartImg = hImg; };
    hImg.src = "/sprites/heart.png";

    function draw() {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const anim = anims[currentState];
      const y = getY();

      ctx.save();
      if (dir === -1 && currentState === "walk") {
        ctx.translate(x + DRAW_W, y);
        ctx.scale(-1, 1);
        ctx.drawImage(anim.img, frame * FRAME_W, 0, FRAME_W, FRAME_H, 0, 0, DRAW_W, DRAW_H);
      } else {
        ctx.drawImage(anim.img, frame * FRAME_W, 0, FRAME_W, FRAME_H, x, y, DRAW_W, DRAW_H);
      }
      ctx.restore();

      // draw hearts
      if (heartImg) {
        for (const h of hearts) {
          ctx.save();
          ctx.globalAlpha = h.opacity;
          ctx.drawImage(heartImg, h.x - HEART_SIZE / 2, h.y - HEART_SIZE / 2, HEART_SIZE, HEART_SIZE);
          ctx.restore();
        }
      }
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
      loadSheet("/sprites/weez_idle.png", 2, [1500, 200]),
      loadSheet("/sprites/weez_walk.png", 2, [250, 250]),
      loadSheet("/sprites/weez_pet.png", 1, [1200]),
    ]).then(([idle, walk, pet]) => {
      anims = { idle, walk, pet };
      resize();
      x = (canvas.getBoundingClientRect().width - DRAW_W) / 2;
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
