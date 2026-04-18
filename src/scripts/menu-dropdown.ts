/**
 * Reusable menubar dropdown system.
 *
 * Markup contract:
 *   <button data-menu-trigger="name">Label</button>
 *   <div class="menubar-dropdown" data-menu-dropdown="name">
 *     <button data-action="custom-event-name">…</button>
 *     <hr />  <!-- optional separator -->
 *   </div>
 *
 * Clicking a trigger toggles its dropdown. Clicking an item dispatches
 * its `data-action` as a CustomEvent on `document`, then closes the menu.
 */

export function initMenuDropdowns() {
  const triggers = document.querySelectorAll<HTMLElement>("[data-menu-trigger]");

  function closeAll() {
    document
      .querySelectorAll<HTMLElement>(".menubar-dropdown[data-open]")
      .forEach((d) => d.removeAttribute("data-open"));
    document
      .querySelectorAll<HTMLElement>(".menubar-menu[data-active]")
      .forEach((t) => t.removeAttribute("data-active"));
  }

  function openDropdown(trigger: HTMLElement, dropdown: HTMLElement) {
    closeAll();
    dropdown.setAttribute("data-open", "");
    trigger.setAttribute("data-active", "");
    updateDynamicLabels(dropdown);
  }

  triggers.forEach((trigger) => {
    const name = trigger.dataset.menuTrigger;
    const dropdown = document.querySelector<HTMLElement>(
      `[data-menu-dropdown="${name}"]`,
    );
    if (!dropdown) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dropdown.hasAttribute("data-open")) {
        closeAll();
      } else {
        openDropdown(trigger, dropdown);
      }
    });

    // Hovering a different trigger while one is open switches the menu
    trigger.addEventListener("pointerenter", () => {
      if (!document.querySelector(".menubar-dropdown[data-open]")) return;
      openDropdown(trigger, dropdown);
    });
  });

  // Item clicks → dispatch action, close menu
  document.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-menu-dropdown] [data-action]",
    );
    if (item && !item.hasAttribute("disabled")) {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent(item.dataset.action!));
      closeAll();
      return;
    }
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
}

/** Update labels that depend on window state (e.g. Maximize ↔ Restore). */
function updateDynamicLabels(dropdown: HTMLElement) {
  const focused = document.querySelector<HTMLElement>("[data-focused]");
  const isMaximized = focused?.dataset.maximized === "true";
  const hasWindow = !!focused;

  const label = dropdown.querySelector<HTMLElement>(
    "[data-menu-label='maximize']",
  );
  if (label) label.textContent = isMaximized ? "Restore" : "Maximize";

  dropdown
    .querySelectorAll<HTMLElement>("[data-action]")
    .forEach((item) => item.toggleAttribute("disabled", !hasWindow));
}
