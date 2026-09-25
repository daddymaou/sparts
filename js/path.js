/**
 * path.js — scroll-driven bus animation along a hand-drawn SVG path.
 *
 * The bus follows a cubic Bézier through the .path-node cards as the user
 * scrolls the section into view. Nodes highlight as the bus passes them.
 * Keyboard: when focus is inside #pathWrap, arrow keys step between nodes.
 * Debug: press "d" while focus is inside #pathWrap to show node anchor dots.
 *
 * Respects prefers-reduced-motion by snapping instead of animating.
 */

import { $, $$, clamp, debounce, reduced } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const NODE_SELECTOR = ".path-node";
const CARD_SELECTOR = ".path-node__card";
const DEBUG_DOT_CLASS = "debug-dot";
const DEBUG_MODE_CLASS = "debug-mode";

const MOBILE_BREAKPOINT = 768;
const MOBILE_LEFT_PX = 16;
const Y_OFFSET_MAX = 70;
const Y_OFFSET_RATIO = 0.3;
const BUS_ROTATION_LOOKAHEAD = 0.003;
const ANIMATION_SMOOTHING = 0.13;
const ANIMATION_EPSILON = 0.0006;
const ACTIVE_INDEX_SLACK = 1.08;
const DEBUG_DOT_SIZE_PX = 6;

const DESTINATIONS = {
  desk: "work.html",
  lab: "lab.html",
  notes: "notes.html",
  hang: "hang.html",
};

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initPath() {
  const wrap = $("#pathWrap");
  const svg = $("#pathSvg");
  const base = $("#pathBase");
  const progress = $("#pathProgress");
  const bus = $("#pathBus");

  if (!wrap || !svg || !base || !progress || !bus) return;

  // Idempotency guard.
  if (wrap.dataset.pathInit === "1") return;
  wrap.dataset.pathInit = "1";

  const nodes = $$(NODE_SELECTOR, wrap);
  if (nodes.length < 2) return;

  const state = {
    points: [],
    length: 0,
    current: 0,
    target: 0,
    active: 0,
    raf: 0,
  };

  /* ---------------------------------------------------------------- */
  /* Geometry                                                          */
  /* ---------------------------------------------------------------- */

  const computePoints = () => {
    const wrapBox = wrap.getBoundingClientRect();
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;

    return nodes.map((node, i) => {
      const card = node.querySelector(CARD_SELECTOR);
      if (!card) return { x: 0, y: 0 };

      const box = card.getBoundingClientRect();
      const x = mobile
        ? MOBILE_LEFT_PX
        : (i % 2 ? box.left - wrapBox.left : box.right - wrapBox.left);
      const y = box.top - wrapBox.top + Math.min(box.height * Y_OFFSET_RATIO, Y_OFFSET_MAX);

      return { x, y };
    });
  };

  const buildPathData = (points) => {
    if (!points.length) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      // Smooth vertical S-curve: control points along the a→b vector.
      const c1y = a.y + (b.y - a.y) * 0.4;
      const c2y = a.y + (b.y - a.y) * 0.6;
      d += ` C ${a.x} ${c1y} ${b.x} ${c2y} ${b.x} ${b.y}`;
    }
    return d;
  };

  /* ---------------------------------------------------------------- */
  /* Drawing                                                           */
  /* ---------------------------------------------------------------- */

  const draw = () => {
    state.points = computePoints();

    const width = wrap.clientWidth;
    const height = wrap.scrollHeight;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));

    const d = buildPathData(state.points);
    base.setAttribute("d", d);
    progress.setAttribute("d", d);

    state.length = progress.getTotalLength();
    base.style.strokeDasharray = `${state.length} ${state.length}`;
    progress.style.strokeDasharray = `${state.length} ${state.length}`;
    progress.style.strokeDashoffset = state.length * (1 - state.current);

    // Refresh debug dots if debug mode is active.
    if (wrap.classList.contains(DEBUG_MODE_CLASS)) {
      renderDebugDots();
    }
  };

  /* ---------------------------------------------------------------- */
  /* Bus + node highlighting                                           */
  /* ---------------------------------------------------------------- */

  const setActive = (next) => {
    if (next === state.active) return;
    state.active = next;
    nodes.forEach((node, i) => {
      node.classList.toggle("is-active", i <= next);
      const card = node.querySelector(CARD_SELECTOR);
      if (!card) return;
      if (i === next) card.setAttribute("aria-current", "location");
      else card.removeAttribute("aria-current");
    });
  };

  const update = (ratio) => {
    if (!state.length) return;
    const r = clamp(ratio, 0, 1);

    const p = progress.getPointAtLength(state.length * r);
    const lookahead = Math.min(state.length, state.length * (r + BUS_ROTATION_LOOKAHEAD));
    const n = progress.getPointAtLength(lookahead);

    const dx = n.x - p.x;
    const dy = n.y - p.y;
    const angle = (dx || dy) ? Math.atan2(dy, dx) * 180 / Math.PI : 0;

    bus.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
    progress.style.strokeDashoffset = state.length * (1 - r);

    const next = Math.min(
      nodes.length - 1,
      Math.floor(r * nodes.length * ACTIVE_INDEX_SLACK)
    );
    setActive(next);
  };

  /* ---------------------------------------------------------------- */
  /* Animation loop                                                    */
  /* ---------------------------------------------------------------- */

  const animate = () => {
    if (reduced()) {
      state.current = state.target;
      update(state.current);
      return;
    }

    state.current += (state.target - state.current) * ANIMATION_SMOOTHING;
    update(state.current);

    if (Math.abs(state.target - state.current) > ANIMATION_EPSILON) {
      state.raf = requestAnimationFrame(animate);
    }
  };

  const scheduleAnimate = () => {
    cancelAnimationFrame(state.raf);
    if (reduced()) {
      state.current = state.target;
      update(state.current);
    } else {
      state.raf = requestAnimationFrame(animate);
    }
  };

  const go = (i) => {
    const node = nodes[i];
    if (!node) return;
    state.target = i / (nodes.length - 1);
    node.scrollIntoView({
      behavior: reduced() ? "auto" : "smooth",
      block: "center",
    });
    scheduleAnimate();
  };

  /* ---------------------------------------------------------------- */
  /* Scroll                                                            */
  /* ---------------------------------------------------------------- */

  const onScroll = () => {
    const box = wrap.getBoundingClientRect();
    state.target = clamp(
      (window.innerHeight * 0.55 - box.top) / box.height,
      0,
      1
    );
    scheduleAnimate();
  };

  /* ---------------------------------------------------------------- */
  /* Node interaction                                                  */
  /* ---------------------------------------------------------------- */

  const activate = (node) => {
    const key = node.dataset.node;
    if (DESTINATIONS[key]) {
      window.location.href = DESTINATIONS[key];
      return;
    }
    go(nodes.indexOf(node));
  };

  nodes.forEach((node) => {
    const card = node.querySelector(CARD_SELECTOR);
    if (!card) return;

    card.addEventListener("click", () => activate(node));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate(node);
      }
    });
  });

  /* ---------------------------------------------------------------- */
  /* Keyboard (scoped to #pathWrap)                                    */
  /* ---------------------------------------------------------------- */

  wrap.addEventListener("keydown", (e) => {
    // Ignore when typing in a form field.
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    // Debug mode: only with plain "d".
    if (
      e.key.toLowerCase() === "d" &&
      !e.metaKey && !e.ctrlKey && !e.altKey
    ) {
      toggleDebug();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      go(Math.min(nodes.length - 1, state.active + 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      go(Math.max(0, state.active - 1));
    }
  });

  /* ---------------------------------------------------------------- */
  /* Debug dots                                                        */
  /* ---------------------------------------------------------------- */

  const clearDebugDots = () => {
    $$("." + DEBUG_DOT_CLASS, wrap).forEach((d) => d.remove());
  };

  const renderDebugDots = () => {
    clearDebugDots();
    state.points.forEach((p) => {
      const dot = document.createElement("i");
      dot.className = DEBUG_DOT_CLASS;
      dot.style.left = `${p.x}px`;
      dot.style.top = `${p.y}px`;
      dot.style.width = `${DEBUG_DOT_SIZE_PX}px`;
      dot.style.height = `${DEBUG_DOT_SIZE_PX}px`;
      wrap.append(dot);
    });
  };

  const toggleDebug = () => {
    const on = wrap.classList.toggle(DEBUG_MODE_CLASS);
    if (on) renderDebugDots();
    else clearDebugDots();
  };

  /* ---------------------------------------------------------------- */
  /* Wiring + initial render                                           */
  /* ---------------------------------------------------------------- */

  const onResize = debounce(draw);
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  // Wait for fonts before drawing so metrics are stable.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    draw();
    onScroll();
  });

  draw();
  onScroll();
}