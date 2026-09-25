/**
 * lowdata.js — low-data mode toggle + auto-detection.
 *
 * Responsibilities:
 *   - Read the user's saved preference (localStorage).
 *   - On first visit, auto-enable low-data if the connection looks slow.
 *   - Toggle a `low-data` class on <body> for CSS to hook into.
 *   - Pause/clear and restore <video class="data-media"> elements.
 *   - Show a one-time prompt when auto-detection suggests low-data.
 *
 * Dependencies: `$`, `store` from utils.js.
 */

import { $, store } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const KEY_PREF = "spare-parts:lowdata";
const KEY_PROMPT_DISMISSED = "spare-parts:lowdata:prompt-dismissed";
const BODY_CLASS = "low-data";
const VIDEO_SELECTOR = "video.data-media";
const SAVINGS_COPY = "low-data mode / saving about 2.7 MB";

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initLowData() {
  const toggle = $("#lowDataToggle");
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  const auto = Boolean(
    connection?.saveData ||
    ["slow-2g", "2g"].includes(connection?.effectiveType)
  );

  const saved = store.get(KEY_PREF);
  const active = saved == null ? auto : saved === "true";

  applyState(active, toggle);

  // Only show the readout on pages that actually have a toggle.
  if (toggle) {
    ensureReadout(active);
  }

  // Wire the checkbox.
  toggle?.addEventListener("change", () => {
    setLowData(toggle.checked, toggle);
  });

  // One-time auto-prompt.
  const promptDismissed = store.get(KEY_PROMPT_DISMISSED) === "true";
  if (auto && saved == null && !promptDismissed) {
    showAutoPrompt(toggle);
  }
}

/* ------------------------------------------------------------------ */
/* Core state                                                          */
/* ------------------------------------------------------------------ */

function applyState(on, toggle) {
  document.body.classList.toggle(BODY_CLASS, on);
  if (toggle) toggle.checked = on;
}

function setLowData(on, toggle) {
  applyState(on, toggle);
  store.set(KEY_PREF, String(on));
  updateReadout(on);
  updateVideos(on);
}

/* ------------------------------------------------------------------ */
/* Video handling                                                      */
/* ------------------------------------------------------------------ */

function updateVideos(on) {
  document.querySelectorAll(VIDEO_SELECTOR).forEach((video) => {
    if (on) {
      // Pause + drop the source so the browser stops fetching.
      try { video.pause(); } catch {}
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.currentTime = 0;
        video.load();
      }
    } else if (video.dataset.src) {
      // Restore the source and resume.
      video.src = video.dataset.src;
      video.load();
      const playPromise = video.play?.();
      if (playPromise && typeof playPromise.catch === "function") {
        // Autoplay can be blocked; swallow the rejection quietly.
        playPromise.catch(() => {});
      }
    }
  });
}

/* ------------------------------------------------------------------ */
/* Readout                                                             */
/* ------------------------------------------------------------------ */

function ensureReadout(on) {
  let readout = document.querySelector(".lowdata-readout");
  if (!readout) {
    readout = document.createElement("div");
    readout.className = "lowdata-readout";
    readout.setAttribute("role", "status");
    readout.setAttribute("aria-live", "polite");
    document.body.append(readout);
  }
  updateReadout(on);
}

function updateReadout(on) {
  const readout = document.querySelector(".lowdata-readout");
  if (!readout) return;
  readout.textContent = on ? SAVINGS_COPY : "low-data mode / off";
  readout.hidden = false; // keep visible; text conveys state
}

/* ------------------------------------------------------------------ */
/* Auto prompt                                                         */
/* ------------------------------------------------------------------ */

function showAutoPrompt(toggle) {
  const note = document.createElement("div");
  note.className = "nepa-prompt lowdata-prompt";
  note.setAttribute("role", "status");
  note.setAttribute("aria-live", "polite");

  const p = document.createElement("p");
  p.textContent =
    "Your connection looks careful today. Low-data mode is ready and saves about 2.7 MB.";

  const actions = document.createElement("div");
  actions.className = "nepa-prompt__actions";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.textContent = "use low-data";
  yes.addEventListener("click", () => {
    setLowData(true, toggle);
    store.set(KEY_PROMPT_DISMISSED, "true");
    note.remove();
  });

  const no = document.createElement("button");
  no.type = "button";
  no.textContent = "not now";
  no.addEventListener("click", () => {
    store.set(KEY_PROMPT_DISMISSED, "true");
    note.remove();
  });

  actions.append(yes, no);
  note.append(p, actions);
  document.body.append(note);
}