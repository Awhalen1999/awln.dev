type ToastType = "info" | "success" | "error";

const TOAST_GAP = 8;
const active: HTMLElement[] = [];

export function showToast(
  message: string,
  type: ToastType = "info",
  duration = 2500,
) {
  const el = document.createElement("div");
  el.className = "toast";
  el.dataset.type = type;
  el.setAttribute("role", "status");
  el.innerHTML = `<span class="toast-bar"></span><span class="toast-msg">${message}</span>`;

  document.body.appendChild(el);
  active.push(el);
  restack();

  // Trigger enter animation on next frame
  requestAnimationFrame(() => el.classList.add("toast-in"));

  const dismiss = () => {
    el.classList.remove("toast-in");
    el.classList.add("toast-out");
    el.addEventListener("animationend", () => {
      el.remove();
      const i = active.indexOf(el);
      if (i !== -1) active.splice(i, 1);
      restack();
    }, { once: true });
  };

  setTimeout(dismiss, duration);
}

function restack() {
  let offset = 0;
  for (let i = active.length - 1; i >= 0; i--) {
    active[i].style.setProperty("--toast-offset", `${offset}px`);
    offset += active[i].offsetHeight + TOAST_GAP;
  }
}
