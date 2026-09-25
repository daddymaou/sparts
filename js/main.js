/**
 * main.js — page bootstrap and DOM rendering.
 *
 * Imports all feature modules, then wires up the page-specific rendering:
 *   - preloader dismissal
 *   - work.html project grid + photo contact sheet + project dialog
 *   - notes.html filter + notes grid + reading sheet
 *   - hang.html contact form with 4-channel picker (WA / TG / X / Email)
 *
 * Every init is wrapped in try/catch so one failure doesn't kill the page.
 */

import { initTheme } from "./theme.js";
import { initNav } from "./nav.js";
import { initPath } from "./path.js";
import { initMedia } from "./media.js";
import { initLowData } from "./lowdata.js";
import { initNepa } from "./nepa.js";
import { initTerminal } from "./terminal.js";
import { initMotion, refreshMotion } from "./motion.js";
import { initLab } from "./lab.js";

import { $, $$, escapeHtml } from "./utils.js";
import { projects, notes, tags, photos } from "./content.js";

/* ================================================================== */
/* Contact configuration — edit these to change where notes land      */
/* ================================================================== */

const CONTACT = {
  whatsapp: "2348154899093",     // digits only, no + or spaces
  telegram: "fwmoau",            // without @
  x: "fwmaou",                   // without @
  email: "daddymaouu@gmail.com",
};

/* ================================================================== */
/* Small helpers                                                      */
/* ================================================================== */

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const safeCall = (label, fn) => {
  try {
    fn();
  } catch (err) {
    console.error(`[main] ${label} failed:`, err);
  }
};

/* ================================================================== */
/* Preloader                                                          */
/* ================================================================== */

function preloader() {
  const el = $("#preloader");
  if (!el) return;

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    el.classList.add("is-done");
  };

  if (document.readyState === "complete") {
    setTimeout(finish, 650);
  } else {
    window.addEventListener("load", () => setTimeout(finish, 650), { once: true });
  }

  // Failsafe — never block longer than 4s.
  setTimeout(finish, 4000);

  // Click to dismiss early.
  el.addEventListener("click", finish);
}

/* ================================================================== */
/* Projects (work.html)                                               */
/* ================================================================== */

function renderProjects() {
  const root = $("#projectGrid");
  if (!root) return;

  const dialog = $("#projectDialog");

  // ---- project cards ------------------------------------------------
  root.innerHTML = projects
    .map((p, i) => {
      const title = escapeHtml(p.title);
      const kind = escapeHtml(p.kind);
      const description = escapeHtml(p.description);
      const media = p.video
        ? `<video class="data-media" data-src="${escapeHtml(p.video)}" poster="${escapeHtml(p.image)}" muted loop playsinline preload="none"></video>`
        : `<img loading="lazy" src="${escapeHtml(p.image)}" width="1200" height="800" alt="${title} project preview">`;

      const stackTags = (p.stack || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("");

      return `
        <article class="project-card tape-card"
                 data-project="${i}"
                 role="button"
                 tabindex="0"
                 aria-label="Open project: ${title}">
          <div class="project-card__media">${media}</div>
          <span class="eyebrow">${kind}</span>
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="tag-row">${stackTags}</div>
          <span class="mono project-link-note">link / swap in content.js</span>
        </article>
      `;
    })
    .join("");

  // ---- photo contact sheet -----------------------------------------
  const drawer = $("#photoContactSheet");
  if (drawer) {
    const photoMarkup = (photos || [])
      .map((photo) => {
        // Support both shapes: { file, alt } and [file, caption]
        const file = typeof photo === "string" ? photo : photo.file;
        const caption = Array.isArray(photo) ? photo[1] : (photo.alt || "");
        return `
          <figure>
            <img loading="lazy"
                 src="${escapeHtml(file)}"
                 width="1200" height="800"
                 alt="${escapeHtml(caption)}">
            <figcaption>${escapeHtml(caption)}</figcaption>
          </figure>
        `;
      })
      .join("");

    drawer.innerHTML = `
      <p class="eyebrow">the photo drawer / real references</p>
      <div>${photoMarkup}</div>
    `;
  }

  // ---- open project dialog -----------------------------------------
  const openProject = (card) => {
    if (!card || !dialog) return;

    const project = projects[Number(card.dataset.project)];
    if (!project) return;

    const eyebrow = dialog.querySelector("#dialogEyebrow");
    const titleEl = dialog.querySelector("#dialogTitle");
    const storyEl = dialog.querySelector("#dialogStory");
    const tagsEl = dialog.querySelector("#dialogTags");

    if (eyebrow) eyebrow.textContent = project.kind;
    if (titleEl) titleEl.textContent = project.title;
    if (storyEl) storyEl.textContent = project.story;
    if (tagsEl) {
      tagsEl.innerHTML = (project.stack || [])
        .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("");
    }

    dialog._returnFocus = card;

    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch (err) {
        if (err?.name !== "AbortError") console.warn("[main] showModal:", err);
      }
    }
  };

  root.addEventListener("click", (e) => {
    const card = e.target.closest(".project-card");
    if (card) openProject(card);
  });

  root.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".project-card");
    if (!card) return;
    e.preventDefault();
    openProject(card);
  });

  $("#dialogClose")?.addEventListener("click", () => {
    if (!dialog) return;
    try { dialog.close(); } catch {}
  });

  dialog?.addEventListener("close", () => {
    const target = dialog._returnFocus;
    dialog._returnFocus = null;
    if (target && typeof target.focus === "function") target.focus();
  });
}

/* ================================================================== */
/* Notes (notes.html)                                                 */
/* ================================================================== */

function renderNotes() {
  const grid = $("#notesGrid");
  const filters = $("#noteFilters");
  const sheet = $("#readingSheet");
  if (!grid || !filters) return;

  // Ensure "all" is present even if content.js doesn't include it.
  const allTags = tags.includes("all") ? tags : ["all", ...tags];

  filters.innerHTML = allTags
    .map(
      (t) =>
        `<button type="button" data-tag="${escapeHtml(t)}" aria-pressed="false">${escapeHtml(t)}</button>`
    )
    .join("");

  const render = (tag) => {
    grid.innerHTML = notes
      .filter((n) => tag === "all" || n.tag === tag)
      .map((n) => {
        const id = notes.indexOf(n);
        return `
          <article class="note-card"
                   tabindex="0"
                   role="button"
                   data-note="${id}"
                   aria-label="Read note: ${escapeHtml(n.title)}">
            <span class="note-card__meta">${escapeHtml(n.date)} · ${escapeHtml(n.tag)}</span>
            <h3>${escapeHtml(n.title)}</h3>
            <p>${escapeHtml(n.body)}</p>
            <span class="note-card__read">read the note →</span>
          </article>
        `;
      })
      .join("");

    filters.querySelectorAll("button[data-tag]").forEach((btn) => {
      const pressed = btn.dataset.tag === tag;
      btn.setAttribute("aria-pressed", String(pressed));
      btn.classList.toggle("is-active", pressed);
    });
  };

  render("all");

  filters.addEventListener("click", (e) => {
    const tag = e.target.dataset?.tag;
    if (tag) render(tag);
  });

  const openNote = (card) => {
    if (!card || !sheet) return;
    const note = notes[Number(card.dataset.note)];
    if (!note) return;

    const titleEl = sheet.querySelector("#readingTitle");
    const bodyEl = sheet.querySelector("#readingBody");
    if (titleEl) titleEl.textContent = note.title;
    if (bodyEl) bodyEl.textContent = note.body;

    sheet.hidden = false;
    sheet.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });

    if (!sheet.hasAttribute("tabindex")) sheet.setAttribute("tabindex", "-1");
    sheet.focus({ preventScroll: true });
  };

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".note-card");
    if (card) openNote(card);
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".note-card");
    if (!card) return;
    e.preventDefault();
    openNote(card);
  });
}

/* ================================================================== */
/* Contact form + channel picker (hang.html)                          */
/* ================================================================== */

function initContact() {
  const form = $("#contactForm");
  if (!form) return;

  const channels = $("#contactChannels");
  const requiredFields = ["contactName", "contactMessage"];

  const setError = (field, message) => {
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    if (error) error.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const composeMessage = () => {
    const name = $("#contactName")?.value.trim() || "Someone";
    const email = $("#contactEmail")?.value.trim() || "";
    const body = $("#contactMessage")?.value.trim() || "";

    return [
      `Hi Spare Parts — ${name} here.`,
      "",
      body,
      "",
      email ? `Reply to: ${email}` : "No reply email provided.",
    ].join("\n");
  };

  const wireChannels = () => {
    const text = composeMessage();
    const encoded = encodeURIComponent(text);
    const subject = encodeURIComponent("Hello from the Spare Parts site");

    const wa = $("#channelWhatsApp");
    if (wa) wa.href = `https://wa.me/${CONTACT.whatsapp}?text=${encoded}`;

    const tg = $("#channelTelegram");
    if (tg) tg.href = `https://t.me/${CONTACT.telegram}?text=${encoded}`;

    const x = $("#channelX");
    if (x) {
      const xText = `Hi @${CONTACT.x} — ${composeMessage().slice(0, 200)}`;
      x.href = `https://x.com/intent/tweet?text=${encodeURIComponent(xText)}`;
    }

    const mail = $("#channelEmail");
    if (mail) mail.href = `mailto:${CONTACT.email}?subject=${subject}&body=${encoded}`;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (channels) channels.hidden = true;

    let valid = true;
    let firstInvalid = null;

    requiredFields.forEach((id) => {
      const field = $("#" + id);
      if (!field) return;
      if (!field.value.trim()) {
        setError(field, "this bit is needed.");
        valid = false;
        if (!firstInvalid) firstInvalid = field;
      } else {
        setError(field, "");
      }
    });

    const email = $("#contactEmail");
    if (email) {
      if (email.value.trim() && !email.validity.valid) {
        setError(email, "that email looks a bit sideways.");
        valid = false;
        if (!firstInvalid) firstInvalid = email;
      } else {
        setError(email, "");
      }
    }

    if (!valid) {
      firstInvalid?.focus();
      return;
    }

    wireChannels();
    if (channels) {
      channels.hidden = false;
      channels.querySelector(".contact-channel")?.focus();
    }
  });
}

/* ================================================================== */
/* Bootstrap                                                          */
/* ================================================================== */

safeCall("theme", initTheme);
safeCall("nav", initNav);
safeCall("path", initPath);
safeCall("lowdata", initLowData);
safeCall("nepa", initNepa);
safeCall("terminal", initTerminal);
safeCall("lab", initLab);

// Render dynamic content first.
safeCall("projects", renderProjects);
safeCall("notes", renderNotes);
safeCall("contact", initContact);

// Then wire up motion so newly-rendered cards get their tilt.
safeCall("motion", initMotion);
safeCall("media", initMedia);

safeCall("preloader", preloader);