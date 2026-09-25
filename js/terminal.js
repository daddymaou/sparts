/**
 * terminal.js — a small, in-page terminal easter egg.
 *
 * Opens with the backtick key, or via a floating trigger button (useful on
 * touch devices and non-US keyboards). Commands are matched case-insensitively
 * and printed via textContent — never innerHTML — so user input is safe.
 *
 * Commands: help, whoami, ls work, open notes, theme night|day, japa,
 *           jollof --party, sudo make-me-a-sandwich, clear, exit.
 */

import { $, $$, escapeHtml } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const CLASS_OPEN = "is-open";
const MAX_HISTORY = 50;

const COMMANDS = [
  "help",
  "whoami",
  "ls work",
  "open notes",
  "theme night",
  "theme day",
  "japa",
  "jollof --party",
  "sudo make-me-a-sandwich",
  "clear",
  "exit",
];

const HELP_TEXT = [
  "help",
  "whoami",
  "ls work",
  "open notes",
  "theme night | theme day",
  "japa",
  "jollof --party",
  "sudo make-me-a-sandwich",
  "clear",
  "exit",
].join("\n");

const WELCOME =
  "Spare Parts terminal. Type help, or type something brave.";
const HINT =
  "press ` to open. the terminal is local and slightly opinionated.";

/* ------------------------------------------------------------------ */
/* Public entry                                                        */
/* ------------------------------------------------------------------ */

export function initTerminal() {
  if (document.querySelector(".terminal")) return;

  const terminal = buildTerminal();
  document.body.append(terminal);

  const output = terminal.querySelector("#terminalOutput");
  const input = terminal.querySelector("#terminalInput");
  const form = terminal.querySelector("#terminalForm");
  const closeBtn = terminal.querySelector("#closeTerminal");

  const history = [];
  let historyIndex = -1;

  /* ---------------------------------------------------------------- */
  /* Output                                                            */
  /* ---------------------------------------------------------------- */

  const print = (text) => {
    // Always textContent — never innerHTML.
    String(text).split("\n").forEach((line) => {
      const el = document.createElement("div");
      el.textContent = line;
      output.append(el);
    });
    output.scrollTop = output.scrollHeight;
  };

  /* ---------------------------------------------------------------- */
  /* Command dispatch                                                  */
  /* ---------------------------------------------------------------- */

  const run = (raw) => {
    const cmd = raw.trim().replace(/\s+/g, " ");
    if (!cmd) return;

    history.push(cmd);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length;

    print(`› ${cmd}`);

    const lower = cmd.toLowerCase();

    if (lower === "help") return print(HELP_TEXT);
    if (lower === "whoami") {
      return print("a human with too many tabs and a working hotspot.");
    }
    if (lower === "ls work") {
      return print("queue-party/  yaba-weather/  pantry-list/  briefly/");
    }
    if (lower === "open notes") {
      window.location.href = "notes.html";
      return;
    }
    if (lower === "theme night" || lower === "theme day") {
      const theme = lower.split(" ")[1];
      document.documentElement.dataset.theme = theme;
      return print(`theme set to ${theme}.`);
    }
    if (lower === "japa") {
      return print("japa mode engaged. cache the important things.");
    }
    if (lower === "jollof --party") {
      return print("  (ง'̀-'́)ง  JOLLOF PARTY\n  rice + friends + no unnecessary discourse");
    }
    if (lower === "sudo make-me-a-sandwich") {
      return print("[sudo] password for human: nice try.\nMaking a sandwich anyway. (bread.exe)");
    }
    if (lower === "clear") {
      output.textContent = "";
      return;
    }
    if (lower === "exit" || lower === "quit") {
      close();
      return;
    }

    print(`command not found: ${cmd}. try help.`);
  };

  /* ---------------------------------------------------------------- */
  /* Open / close                                                      */
  /* ---------------------------------------------------------------- */

  let lastFocused = null;

  const open = () => {
    lastFocused = document.activeElement;
    terminal.classList.add(CLASS_OPEN);
    terminal.setAttribute("aria-hidden", "false");

    if (!output.children.length) print(WELCOME);

    // Defer focus until the open transition settles.
    requestAnimationFrame(() => input.focus());
  };

  const close = () => {
    terminal.classList.remove(CLASS_OPEN);
    terminal.setAttribute("aria-hidden", "true");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const toggle = () => {
    if (terminal.classList.contains(CLASS_OPEN)) close();
    else open();
  };

  /* ---------------------------------------------------------------- */
  /* Wiring                                                            */
  /* ---------------------------------------------------------------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run(input.value);
    input.value = "";
  });

  closeBtn?.addEventListener("click", close);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? "";
      return;
    }

    if (e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? "";
      return;
    }
  });

  // Global trigger — but ignore when the user is typing in a form field.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "`") return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    toggle();
  });

  // Initial state.
  terminal.setAttribute("aria-hidden", "true");
  print(HINT);
}

/* ------------------------------------------------------------------ */
/* DOM construction                                                    */
/* ------------------------------------------------------------------ */

function buildTerminal() {
  const terminal = document.createElement("section");
  terminal.className = "terminal";
  terminal.setAttribute("role", "region");
  terminal.setAttribute("aria-label", "Spare Parts terminal");

  terminal.innerHTML = `
    <div class="terminal__bar">
      <span>spare-parts@desk:~</span>
      <button id="closeTerminal" type="button" aria-label="Close terminal">&times;</button>
    </div>
    <div class="terminal__output" id="terminalOutput" role="log" aria-live="polite" aria-atomic="false"></div>
    <div class="terminal__hint">
      try: help · whoami · ls work · open notes · theme night · japa · jollof --party · sudo make-me-a-sandwich
    </div>
    <form class="terminal__form" id="terminalForm" autocomplete="off">
      <span aria-hidden="true">›</span>
      <input
        class="terminal__input"
        id="terminalInput"
        type="text"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="send"
        aria-label="Terminal command">
    </form>
  `;

  return terminal;
}