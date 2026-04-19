/**
 * Clock — Newfoundland time display and online status indicator.
 */

export function initClock() {
  const clockEl = document.querySelector<HTMLElement>("[data-clock]");
  const statusEl = document.querySelector<HTMLElement>("[data-status]");

  const nfFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/St_Johns",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });

  const tick = () => {
    const parts = nfFmt.formatToParts(new Date());
    const p: Record<string, string> = {};
    for (const { type, value } of parts) p[type] = value;

    if (clockEl) {
      clockEl.textContent =
        `${p.weekday} ${p.day} ${p.month} ${p.hour}:${p.minute} ${p.timeZoneName}`;
    }
    if (statusEl) {
      const hour = parseInt(p.hour, 10) % 24;
      const online = hour >= 9 && hour < 22;
      statusEl.dataset.online = online ? "true" : "false";
      statusEl.textContent = online ? "\u25CF online" : "\u25CF offline";
    }
  };

  tick();
  // Align the first scheduled tick to the next minute boundary so the
  // visible minute flips cleanly, not drifted by page-load time.
  const msToMinute = 60_000 - (Date.now() % 60_000);
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, msToMinute);
}
