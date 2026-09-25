/**
 * media.js — lazy video playback for .data-media elements.
 *
 * Behavior:
 *   - Videos load their `data-src` only when they scroll near the viewport.
 *   - Respects `prefers-reduced-motion` and low-data mode: in either case,
 *     videos are paused and their source is not attached.
 *   - Re-checks low-data / reduced-motion state on every intersection, so
 *     toggling low-data mid-session works.
 *   - Listens for low-data toggle events to pause/resume all videos.
 *
 * Dependencies: `$$`, `reduced` from utils.js.
 */

import { $$, reduced } from "./utils.js";

const VIDEO_SELECTOR = ".data-media";
const LOW_DATA_CLASS = "low-data";
const LOW_DATA_EVENT = "spare-parts:lowdata-change";
const ROOT_MARGIN = "180px 0px";

/* ------------------------------------------------------------------ */
/* State helpers                                                       */
/* ------------------------------------------------------------------ */

function shouldShowPoster() {
  return (
    reduced() || document.body.classList.contains(LOW_DATA_CLASS)
  );
}

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initMedia() {
  const videos = $$(VIDEO_SELECTOR);
  if (videos.length === 0) return;

  // Idempotency guard.
  if (document.body.dataset.mediaInit === "1") {
    // Re-run against any newly-added videos.
    refreshMedia();
    return;
  }
  document.body.dataset.mediaInit = "1";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        const poster = shouldShowPoster();

        if (entry.isIntersecting && !poster) {
          playVideo(video);
        } else {
          pauseVideo(video, { clearSource: poster });
        }
      });
    },
    { rootMargin: ROOT_MARGIN }
  );

  const observe = (video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    if (!video.dataset.src) return;
    if (video.dataset.observed === "1") return;

    video.dataset.observed = "1";
    video.muted = true;
    video.playsInline = true;

    if (shouldShowPoster()) {
      pauseVideo(video, { clearSource: true });
      return;
    }

    observer.observe(video);
  };

  // Initial pass.
  videos.forEach(observe);

  // Re-run for videos inserted later (dialogs, dynamic render, etc.).
  const refresh = () => {
    $$(VIDEO_SELECTOR).forEach(observe);
  };

  // Public refresh — call after inserting new .data-media elements.
  window.__sparePartsRefreshMedia = refresh;

  // React to low-data toggle events.
  window.addEventListener(LOW_DATA_EVENT, () => {
    const poster = shouldShowPoster();
    $$(VIDEO_SELECTOR).forEach((video) => {
      if (poster) {
        pauseVideo(video, { clearSource: true });
      } else if (isNearViewport(video)) {
        playVideo(video);
      }
    });
  });

  // Pause everything when the tab is hidden (battery + data courtesy).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      $$(VIDEO_SELECTOR).forEach((v) => v.pause?.());
    }
  });

  // Expose for internal calls.
  function refreshMedia() {
    refresh();
  }
}

/* ------------------------------------------------------------------ */
/* Internals                                                           */
/* ------------------------------------------------------------------ */

function playVideo(video) {
  if (!video.dataset.src) return;

  if (!video.src) {
    video.src = video.dataset.src;
    try { video.load(); } catch {}
  }

  const p = video.play?.();
  if (p && typeof p.catch === "function") {
    p.catch((err) => {
      // AbortError: play() interrupted by pause() or src change.
      // NotAllowedError: autoplay policy blocked it.
      if (err?.name && err.name !== "AbortError" && err.name !== "NotAllowedError") {
        console.warn("[media] play failed:", err);
      }
    });
  }
}

function pauseVideo(video, { clearSource = false } = {}) {
  try { video.pause?.(); } catch {}

  if (clearSource && video.hasAttribute("src")) {
    video.removeAttribute("src");
    try { video.load(); } catch {}
  }
}

function isNearViewport(el) {
  const rect = el.getBoundingClientRect();
  const margin = 180; // matches ROOT_MARGIN top/bottom
  return (
    rect.bottom >= -margin &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) + margin
  );
}