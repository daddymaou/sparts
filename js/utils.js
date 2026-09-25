/**
 * utils.js — small shared helpers.
 *
 * Everything here is browser-only. Do not import in server code.
 */

/* ------------------------------------------------------------------ */
/* DOM                                                                 */
/* ------------------------------------------------------------------ */

/** @returns {Element|null} */
export const $ = (selector, scope = document) =>
  scope.querySelector(selector);

/** @returns {Element[]} */
export const $$ = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

/* ------------------------------------------------------------------ */
/* Math                                                                */
/* ------------------------------------------------------------------ */

/**
 * Clamp a number between min and max.
 * Returns `min` if `v` is NaN, so downstream math stays safe.
 */
export const clamp = (v, min, max) =>
  Number.isNaN(v) ? min : Math.min(max, Math.max(min, v));

/* ------------------------------------------------------------------ */
/* Motion preference                                                   */
/* ------------------------------------------------------------------ */

/**
 * True if the user prefers reduced motion.
 * Queried fresh every call so runtime preference changes are respected.
 */
export const reduced = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

/* ------------------------------------------------------------------ */
/* Timing                                                              */
/* ------------------------------------------------------------------ */

/**
 * Debounce a function. The returned wrapper preserves `this` and
 * exposes a `.cancel()` method to clear any pending invocation.
 */
export const debounce = (fn, wait = 120) => {
  let id;
  const wrapper = function (...args) {
    clearTimeout(id);
    id = setTimeout(() => fn.apply(this, args), wait);
  };
  wrapper.cancel = () => {
    clearTimeout(id);
    id = undefined;
  };
  return wrapper;
};

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

/**
 * Escape a value for safe insertion into HTML text or attributes.
 * Handles the five characters that matter: & < > " '.
 *
 * NOT safe for JavaScript, CSS, or URL contexts.
 */
export const escapeHtml = (v = "") =>
  String(v).replace(/[&<>"']/g, (c) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c])
  );

/* ------------------------------------------------------------------ */
/* Local storage                                                       */
/* ------------------------------------------------------------------ */

/**
 * Safe localStorage wrapper. All operations are try/catch guarded so
 * private-mode Safari and disabled storage don't break the site.
 */
export const store = {
  /**
   * @param {string} key
   * @param {*} [fallback]
   */
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  },

  /**
   * @param {string} key
   * @param {*} value
   * @returns {boolean} true if written successfully
   */
  set(key, value) {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (err) {
      console.warn("[store] set failed for", key, err);
      return false;
    }
  },

  /** @param {string} key */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn("[store] remove failed for", key, err);
    }
  },
};

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

/** Current time in 24h Nigerian format, e.g. "14:32:05". */
export const time = () =>
  new Date().toLocaleTimeString("en-NG", { hour12: false });