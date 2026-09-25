/**
 * motion.js — decorative motion for cards and magnetic buttons.
 *
 * Two independent effects:
 *   1. Tilt: applies a stable pseudo-random rotation to cards via the
 *      `--tilt` CSS custom property. Runs unconditionally (tilt is a
 *      static visual detail, not a motion effect).
 *   2. Magnetic: pulls `.magnetic` elements toward the pointer on hover.
 *      Skipped on touch devices and when the user prefers reduced motion.
 *
 * Because initMotion runs before dynamic content is rendered, it exposes
 * `refreshMotion()` so callers can re-apply tilt after DOM updates.
 */

import { $$, reduced } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TILT_SELECTOR = ".project-card, .note-card, .home-media-strip figure";
const MAGNETIC_SELECTOR = ".magnetic";
const TILT_MAX_DEG = 2.8;
const MAGNETIC_STRENGTH = 0.12;
const MAGNETIC_CLAMP_PX = 7;
const SEED_MULTIPLIER = 97.31;
const SEED_OFFSET = 11;

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initMotion() {
  applyTilt();

  // Magnetic pull only on fine pointers, and only if motion is welcome.
  if (matchMedia("(pointer: fine)").matches && !reduced()) {
    applyMagnetic();
  }
}

/**
 * Re-apply tilt to any newly-rendered cards.
 * Call this after renderProjects() / renderNotes().
 */
export function refreshMotion() {
  applyTilt();
}

/* ------------------------------------------------------------------ */
/* Tilt                                                                */
/* ------------------------------------------------------------------ */

function applyTilt() {
  $$(TILT_SELECTOR).forEach((el, i) => {
    if (el.dataset.tiltApplied === "1") return;
    el.dataset.tiltApplied = "1";

    // Stable pseudo-random: same element gets same tilt every page load.
    const seeded = Math.sin((i + SEED_OFFSET) * SEED_MULTIPLIER);
    const deg = (seeded * TILT_MAX_DEG).toFixed(2);
    el.style.setProperty("--tilt", `${deg}deg`);
  });
}

/* ------------------------------------------------------------------ */
/* Magnetic                                                            */
/* ------------------------------------------------------------------ */

function applyMagnetic() {
  $$(MAGNETIC_SELECTOR).forEach((el) => {
    if (el.dataset.magneticBound === "1") return;
    el.dataset.magneticBound = "1";

    let raf = 0;
    let rect = null;

    const reset = () => {
      el.style.setProperty("--mx", "0px");
      el.style.setProperty("--my", "0px");
      rect = null;
    };

    el.addEventListener("pointerenter", () => {
      rect = el.getBoundingClientRect();
    });

    el.addEventListener("pointermove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!rect) rect = el.getBoundingClientRect();

        const dx = clamp(
          (e.clientX - rect.left - rect.width / 2) * MAGNETIC_STRENGTH
        );
        const dy = clamp(
          (e.clientY - rect.top - rect.height / 2) * MAGNETIC_STRENGTH
        );

        el.style.setProperty("--mx", `${dx}px`);
        el.style.setProperty("--my", `${dy}px`);
      });
    });

    el.addEventListener("pointerleave", reset);
    el.addEventListener("pointercancel", reset);
  });
}

function clamp(v) {
  return Math.max(-MAGNETIC_CLAMP_PX, Math.min(MAGNETIC_CLAMP_PX, v));
}