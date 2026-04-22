import type { CustomRenderer } from "./window-manager";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const SCRAMBLE_RADIUS = 80;

const ENTRIES = [
  { site: "root", pass: "xK9#mL2$vQ7@nR4&jW8pT1!bF5cY3hZ" },
  { site: "netflix", pass: "brooklyn99ever!" },
  { site: "wifi", pass: "Get0ffMyLawn2024" },
  { site: "gmail", pass: "p@ssword123" },
  { site: "bank", pass: "Wp6#dR8!kF3mJ9$vNx2" },
  { site: "minecraft", pass: "diamond_pickaxe99" },
];

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

export const passwordsRenderer: CustomRenderer = {
  populate(body) {
    const lines: string[] = [];
    for (const e of ENTRIES) {
      lines.push(
        `<div class="pw-row">` +
          `<span class="pw-site">${e.site}:</span> ` +
          `<span class="pw-pass" data-original="${e.pass}"></span>` +
          `</div>`,
      );
    }
    body.innerHTML = lines.join("");
  },

  onReady(state) {
    const passes = state.body.querySelectorAll<HTMLElement>("[data-original]");
    let mouseX = -9999;
    let mouseY = -9999;
    let frameId = 0;

    // Initialize with real values.
    for (const el of passes) {
      el.textContent = el.dataset.original!;
    }

    state.body.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    state.body.addEventListener("mouseleave", () => {
      mouseX = -9999;
      mouseY = -9999;
    });

    const update = () => {
      for (const el of passes) {
        const original = el.dataset.original!;
        const rect = el.getBoundingClientRect();
        const charW = rect.width / original.length;
        let result = "";

        for (let i = 0; i < original.length; i++) {
          const charX = rect.left + charW * (i + 0.5);
          const charY = rect.top + rect.height / 2;
          const dx = mouseX - charX;
          const dy = mouseY - charY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < SCRAMBLE_RADIUS) {
            result += randomChar();
          } else {
            result += original[i];
          }
        }

        el.textContent = result;
      }
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);

    // Clean up if window is removed.
    const observer = new MutationObserver(() => {
      if (!state.el.isConnected) {
        cancelAnimationFrame(frameId);
        observer.disconnect();
      }
    });
    observer.observe(state.el.parentElement!, { childList: true });
  },
};
