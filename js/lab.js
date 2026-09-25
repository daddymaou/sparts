/**
 * lab.js — interactive toys for the Spare Parts lab page.
 *
 * Exports a single `initLab()` function that wires up:
 *   - the doodle canvas (draw, clear, localStorage persistence, DPR-aware)
 *   - the excuse box (random, non-repeating)
 *   - the danfo destination marquee
 *   - the bug pile / fixed tray drag-and-drop toy (pointer + keyboard)
 *
 * All listeners are attached to elements that may or may not exist on the
 * page, so every section guards against missing DOM before wiring up.
 */

import { $, $$, store } from "./utils.js";
import { excuses as EXCUSES, bugs as BUGS } from "./content.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const DOODLE_KEY = "spare-parts:doodle:lab";
const DOODLE_STROKE = "#2459a6";
const DOODLE_LINE_WIDTH = 3;
const MAX_PIXEL_RATIO = 2;
const SAVE_DEBOUNCE_MS = 300;
const MAX_SAVE_BYTES = 4_000_000; // localStorage is ~5MB; stay under it

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initLab() {
  initDoodleWall();
  initExcuseBox();
  initDanfoBoard();
  initBugToy();
}

/* ------------------------------------------------------------------ */
/* Doodle wall                                                         */
/* ------------------------------------------------------------------ */

function initDoodleWall() {
  const canvas = $("#doodleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const state = {
    drawing: false,
    last: null,
    imageCache: null,
    saveTimer: null,
    ratio: 1,
  };

  const applyTransform = () => {
    ctx.setTransform(state.ratio, 0, 0, state.ratio, 0, 0);
    ctx.strokeStyle = DOODLE_STROKE;
    ctx.lineWidth = DOODLE_LINE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    state.ratio = ratio;

    canvas.width = Math.max(1, Math.round(box.width * ratio));
    canvas.height = Math.max(1, Math.round(box.height * ratio));

    applyTransform();

    if (state.imageCache) {
      ctx.drawImage(state.imageCache, 0, 0, box.width, box.height);
    }
  };

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scheduleSave = () => {
    if (state.saveTimer) clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
      try {
        const dataURL = canvas.toDataURL("image/png");
        if (dataURL.length > MAX_SAVE_BYTES) {
          console.warn("[lab] doodle too large to persist");
          return;
        }
        store.set(DOODLE_KEY, dataURL);
      } catch (err) {
        console.warn("[lab] could not save doodle", err);
      }
    }, SAVE_DEBOUNCE_MS);
  };

  const clear = () => {
    const box = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, box.width, box.height);
    state.imageCache = null;
    try { store.remove?.(DOODLE_KEY); } catch {}
    scheduleSave();
  };

  /* --- restore saved doodle ------------------------------------- */

  const old = store.get(DOODLE_KEY);
  if (old) {
    const image = new Image();
    image.onload = () => {
      state.imageCache = image;
      const box = canvas.getBoundingClientRect();
      ctx.drawImage(image, 0, 0, box.width, box.height);
    };
    image.onerror = () => {
      console.warn("[lab] saved doodle could not be loaded");
      try { store.remove?.(DOODLE_KEY); } catch {}
    };
    image.src = old;
  }

  /* --- pointer events ------------------------------------------- */

  canvas.addEventListener("pointerdown", (e) => {
    state.drawing = true;
    state.last = pos(e);
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!state.drawing || !state.last) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(state.last.x, state.last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    state.last = p;
  });

  const endStroke = (e) => {
    if (!state.drawing) return;
    state.drawing = false;
    state.last = null;
    if (e && e.pointerId != null) {
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    }
    scheduleSave();
  };

  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointercancel", endStroke);
  canvas.addEventListener("pointerleave", (e) => {
    if (e.buttons === 0) endStroke(e);
  });

  /* --- clear button --------------------------------------------- */

  $("#clearDoodle")?.addEventListener("click", clear);

  /* --- resize handling ------------------------------------------ */

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  requestAnimationFrame(resize);
}

/* ------------------------------------------------------------------ */
/* Excuse box                                                          */
/* ------------------------------------------------------------------ */

function initExcuseBox() {
  const excuse = $("#excuseText");
  const button = $("#excuseButton");
  if (!excuse || !button || EXCUSES.length === 0) return;

  let lastIndex = -1;

  button.addEventListener("click", () => {
    let i = Math.floor(Math.random() * EXCUSES.length);
    if (EXCUSES.length > 1 && i === lastIndex) {
      i = (i + 1) % EXCUSES.length;
    }
    lastIndex = i;
    excuse.textContent = EXCUSES[i];
  });
}

/* ------------------------------------------------------------------ */
/* Danfo board                                                         */
/* ------------------------------------------------------------------ */

function initDanfoBoard() {
  const danfo = $("#danfoInput");
  const marquee = $("#danfoMarquee");
  if (!danfo || !marquee) return;

  const render = () => {
    const value = danfo.value.trim() || "—";
    marquee.textContent = `${value} — ${value} — `;
  };

  danfo.addEventListener("input", render);
  render();
}

/* ------------------------------------------------------------------ */
/* Bug toy                                                             */
/* ------------------------------------------------------------------ */

function initBugToy() {
  const pile = $("#bugPile");
  const tray = $("#bugTray");
  if (!pile || !tray || BUGS.length === 0) return;

  if (pile.dataset.bugToyInit === "1") return;
  pile.dataset.bugToyInit = "1";

  let draggedId = null;

  const announce = (() => {
    let live = $("#bugLive");
    if (!live) {
      live = document.createElement("p");
      live.id = "bugLive";
      live.className = "visually-hidden";
      live.setAttribute("aria-live", "polite");
      live.setAttribute("role", "status");
      (tray.parentElement || document.body).append(live);
    }
    return (msg) => {
      live.textContent = "";
      requestAnimationFrame(() => { live.textContent = msg; });
    };
  })();

  const toggleBug = (bug) => {
    if (bug.parentElement === pile) {
      bug.classList.add("is-fixed");
      tray.append(bug);
      announce(`${bug.textContent} moved to fixed`);
    } else {
      bug.classList.remove("is-fixed");
      pile.append(bug);
      announce(`${bug.textContent} moved to open`);
    }
  };

  const makeBug = (label, index) => {
    const bug = document.createElement("button");
    bug.type = "button";
    bug.className = "bug";
    bug.dataset.bug = String(index);
    bug.textContent = label;
    bug.setAttribute("aria-label", `Bug: ${label}`);
    bug.draggable = true;

    bug.addEventListener("dragstart", (e) => {
      draggedId = bug.dataset.bug;
      try { e.dataTransfer.setData("text/plain", draggedId); } catch {}
      e.dataTransfer.effectAllowed = "move";
    });

    bug.addEventListener("dragend", () => { draggedId = null; });
    bug.addEventListener("click", () => toggleBug(bug));

    return bug;
  };

  BUGS.forEach((label, i) => pile.append(makeBug(label, i)));

  const makeDropZone = (zone, target) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      const id = draggedId ?? e.dataTransfer.getData("text/plain");
      if (id == null) return;

      const bug =
        pile.querySelector(`.bug[data-bug="${id}"]`) ||
        tray.querySelector(`.bug[data-bug="${id}"]`);
      if (!bug) return;

      if (target === "tray" && bug.parentElement !== tray) {
        bug.classList.add("is-fixed");
        tray.append(bug);
        announce(`${bug.textContent} moved to fixed`);
      } else if (target === "pile" && bug.parentElement !== pile) {
        bug.classList.remove("is-fixed");
        pile.append(bug);
        announce(`${bug.textContent} moved to open`);
      }
      draggedId = null;
    });
  };

  makeDropZone(pile, "pile");
  makeDropZone(tray, "tray");
}