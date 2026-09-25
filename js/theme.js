/**
 * theme.js — day / night theme with system preference detection.
 *
 * Theme is stored as `data-theme="day|night"` on <html>.
 * Priority order:
 *   1. Explicit user choice (localStorage).
 *   2. System `prefers-color-scheme`.
 *   3. Default to "day".
 *
 * To avoid a flash of the wrong theme, an inline script in <head> should
 * set `data-theme` *before* CSS loads. This module only wires the toggle
 * and syncs state — it does not need to set the initial theme if the
 * inline script already did.
 */

import { $, store } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const KEY = "spare-parts:theme";
const VALID = ["day", "night"];
const DEFAULT = "day";
const THEME_COLORS = { day: "#f5f1e8", night: "#0a0a0a" };

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initTheme() {
  // Idempotency guard.
  if (document.documentElement.dataset.themeInit === "1") return;
  document.documentElement.dataset.themeInit = "1";

  // Resolve initial theme (may already be set by inline head script).
  const stored = store.get(KEY);
  const system = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = VALID.includes(stored) ? stored : (system ? "night" : "day");
  apply(initial, { persist: false });

  // Wire the toggle.
  const toggle = $("#themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = current() === "night" ? "day" : "night";
      apply(next, { persist: true });
    });
  }

  // React to system preference changes (only if user hasn't chosen).
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = (e) => {
    if (store.get(KEY)) return; // user has an explicit preference
    apply(e.matches ? "night" : "day", { persist: false });
  };
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onSystemChange);
  } else if (typeof media.addListener === "function") {
    // Safari < 14 fallback.
    media.addListener(onSystemChange);
  }

  // Sync across tabs.
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const next = VALID.includes(e.newValue) ? e.newValue : initial;
    apply(next, { persist: false });
  });
}

/* ------------------------------------------------------------------ */
/* Internals                                                           */
/* ------------------------------------------------------------------ */

function current() {
  const value = document.documentElement.dataset.theme;
  return VALID.includes(value) ? value : DEFAULT;
}

function apply(theme, { persist = true } = {}) {
  document.documentElement.dataset.theme = theme;

  // Keep browser UI in sync.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.day);

  // Update the toggle button state.
  const toggle = $("#themeToggle");
  if (toggle) {
    const isNight = theme === "night";
    toggle.setAttribute("aria-pressed", String(isNight));
    toggle.setAttribute("aria-label", isNight ? "Switch to day mode" : "Switch to night mode");
    // If the button has a visible label, keep it as the *action*.
    toggle.textContent = isNight ? "day desk" : "night desk";
  }

  if (persist) {
    store.set(KEY, theme);
  }
}