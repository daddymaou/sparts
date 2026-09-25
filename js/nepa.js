/**
 * nepa.js — the "cut the light" easter egg.
 *
 * Adds:
 *   - a footer toggle button that simulates a power cut (adds body.nepa),
 *   - a torch effect following the pointer (throttled, reduced-motion safe),
 *   - a one-time prompt offering to enable the effect on first visit,
 *   - a small generator panel where the user can "pull the cord" 3 times
 *     to restore power.
 *
 * All UI is constructed lazily and guarded for missing elements.
 */

import { $, store, reduced } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BODY_CLASS = "nepa";
const KEY_PROMPT_SEEN = "spare-parts:nepa:prompt-seen";
const CLICKS_NEEDED = 3;
const RESET_DELAY_MS = 650;
const RESET_DELAY_REDUCED_MS = 30;

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initNepa() {
  const toggle = $("#nepaToggle");
  if (!toggle) return;

  // Idempotency guard.
  if (document.body.dataset.nepaInit === "1") return;
  document.body.dataset.nepaInit = "1";

  /* --- overlay -------------------------------------------------- */

  const overlay = document.createElement("div");
  overlay.className = "nepa-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.append(overlay);

  /* --- generator panel ------------------------------------------ */

  const panel = buildGeneratorPanel();
  document.body.append(panel);

  /* --- state ---------------------------------------------------- */

  let clicks = 0;

  const setDark = (on) => {
    document.body.classList.toggle(BODY_CLASS, on);
    toggle.textContent = on ? "bring back power" : "cut the light";
    toggle.setAttribute("aria-pressed", String(on));

    if (on) {
      openPanel();
    } else {
      closePanel();
      clicks = 0;
      updateCounter(panel, 0);
    }
  };

  /* --- toggle button -------------------------------------------- */

  toggle.setAttribute("aria-pressed", "false");
  toggle.addEventListener("click", () => {
    const on = !document.body.classList.contains(BODY_CLASS);
    setDark(on);
  });

  /* --- first-visit prompt --------------------------------------- */

  if (!store.get(KEY_PROMPT_SEEN)) {
    const prompt = buildNepaPrompt({
      onYes: () => {
        store.set(KEY_PROMPT_SEEN, "yes");
        setDark(true);
      },
      onNo: () => {
        store.set(KEY_PROMPT_SEEN, "yes");
      },
    });
    document.body.append(prompt);
  }

  /* --- pointer torch (throttled, reduced-motion safe) ----------- */

  if (!reduced()) {
    let raf = 0;

    const onMove = (e) => {
      if (!document.body.classList.contains(BODY_CLASS)) return;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.body.style.setProperty("--torch-x", `${e.clientX}px`);
        document.body.style.setProperty("--torch-y", `${e.clientY}px`);
      });
    };

    const onLeave = () => {
      document.body.style.removeProperty("--torch-x");
      document.body.style.removeProperty("--torch-y");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
  }
}

/* ------------------------------------------------------------------ */
/* Generator panel                                                     */
/* ------------------------------------------------------------------ */

function buildGeneratorPanel() {
  const panel = document.createElement("section");
  panel.className = "power-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Generator controls");
  panel.hidden = true;

  const heading = document.createElement("h3");
  heading.textContent = "Power is shy.";

  const copy = document.createElement("p");
  copy.textContent =
    "Crank the tiny generator. Tap three times or use the accessible start button.";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "power-button";
  button.id = "startPower";
  button.setAttribute("aria-label", `Pull the cord, 0 of ${CLICKS_NEEDED}`);
  button.innerHTML = `pull the cord <span>(${0}/${CLICKS_NEEDED})</span>`;

  panel.append(heading, copy, button);

  /* --- wire the counter ----------------------------------------- */

  let clicks = 0;

  button.addEventListener("click", () => {
    clicks = Math.min(CLICKS_NEEDED, clicks + 1);
    updateCounter(panel, clicks);
    button.setAttribute(
      "aria-label",
      `Pull the cord, ${clicks} of ${CLICKS_NEEDED}`
    );

    if (clicks >= CLICKS_NEEDED) {
      const delay = reduced() ? RESET_DELAY_REDUCED_MS : RESET_DELAY_MS;
      setTimeout(() => {
        clicks = 0;
        updateCounter(panel, 0);
        button.setAttribute(
          "aria-label",
          `Pull the cord, 0 of ${CLICKS_NEEDED}`
        );
        document.body.classList.remove(BODY_CLASS);
        const toggle = $("#nepaToggle");
        if (toggle) {
          toggle.textContent = "cut the light";
          toggle.setAttribute("aria-pressed", "false");
        }
        closePanel();
      }, delay);
    }
  });

  return panel;
}

function openPanel() {
  const panel = document.querySelector(".power-panel");
  if (!panel) return;
  panel.hidden = false;
  panel.setAttribute("aria-hidden", "false");
}

function closePanel() {
  const panel = document.querySelector(".power-panel");
  if (!panel) return;
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
}

function updateCounter(panel, n) {
  const button = panel.querySelector("#startPower");
  if (!button) return;
  const span = button.querySelector("span");
  if (span) span.textContent = `(${n}/${CLICKS_NEEDED})`;
  else button.textContent = `pull the cord (${n}/${CLICKS_NEEDED})`;
}

/* ------------------------------------------------------------------ */
/* First-visit prompt                                                  */
/* ------------------------------------------------------------------ */

function buildNepaPrompt({ onYes, onNo }) {
  const prompt = document.createElement("div");
  prompt.className = "nepa-prompt";
  prompt.setAttribute("role", "status");
  prompt.setAttribute("aria-live", "polite");

  const text = document.createElement("p");
  text.textContent =
    "Want to see the site during NEPA? It is fully skippable and your eyes are safe.";

  const actions = document.createElement("div");
  actions.className = "nepa-prompt__actions";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.textContent = "cut the light";
  yes.addEventListener("click", () => {
    prompt.remove();
    onYes?.();
  });

  const no = document.createElement("button");
  no.type = "button";
  no.textContent = "not today";
  no.addEventListener("click", () => {
    prompt.remove();
    onNo?.();
  });

  actions.append(yes, no);
  prompt.append(text, actions);
  return prompt;
}