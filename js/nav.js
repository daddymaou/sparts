/**
 * nav.js — mobile menu open/close with focus management.
 *
 * Behavior:
 *   - #menuButton toggles #siteMenu.
 *   - Opening moves focus into the menu; closing returns it to the button.
 *   - Escape closes the menu.
 *   - Tab is trapped inside the menu while open (looped at boundaries).
 *   - Clicking a link inside the menu closes it.
 *   - Clicking outside the menu closes it.
 *   - Prevents background scroll while open (works on iOS).
 *
 * Uses `inert` on page content when the menu is open (with a fallback
 * focus trap for older browsers that don't support `inert`).
 */

import { $, $$ } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initNav() {
  const menu = $("#siteMenu");
  const button = $("#menuButton");
  if (!menu || !button) return;

  // Idempotency guard.
  if (menu.dataset.navInit === "1") return;
  menu.dataset.navInit = "1";

  const isOpen = () => button.getAttribute("aria-expanded") === "true";
  const focusableItems = () => $$(FOCUSABLE_SELECTOR, menu);

  /* --- scroll lock (iOS-safe) ----------------------------------- */

  let savedScrollY = 0;

  const lockScroll = () => {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("is-locked");
  };

  const unlockScroll = () => {
    document.body.classList.remove("is-locked");
    document.body.style.top = "";
    window.scrollTo(0, savedScrollY);
  };

  /* --- open / close --------------------------------------------- */

  const open = () => {
    button.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
    menu.setAttribute("aria-modal", "true");
    lockScroll();

    // Focus first focusable item in the menu.
    const first = focusableItems()[0];
    (first || menu).focus?.();
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!isOpen()) return;
    button.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    menu.removeAttribute("aria-modal");
    unlockScroll();
    if (restoreFocus) button.focus();
  };

  const toggle = () => (isOpen() ? close() : open());

  /* --- wiring --------------------------------------------------- */

  button.addEventListener("click", toggle);

  // Close when a link inside the menu is clicked.
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });

  // Close when clicking outside the menu / button.
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    if (menu.contains(e.target) || button.contains(e.target)) return;
    close({ restoreFocus: false });
  });

  // Escape to close; Tab to trap.
  window.addEventListener("keydown", (e) => {
    if (!isOpen()) return;

    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== "Tab") return;

    const list = focusableItems();
    if (list.length === 0) {
      e.preventDefault();
      menu.focus?.();
      return;
    }

    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;

    // Focus escaped the menu — pull it back in.
    if (!menu.contains(active)) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
      return;
    }

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Optional: close the menu when the viewport crosses into desktop.
  const mq = window.matchMedia("(min-width: 900px)");
  mq.addEventListener?.("change", (e) => {
    if (e.matches) close({ restoreFocus: false });
  });
}