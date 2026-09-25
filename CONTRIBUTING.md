# Contributing to Spare Parts

Thanks for wanting to help. This is a small dev collective, not a startup,
so the process is meant to be friendly and low-ceremony.

> [!NOTE]
> We may not respond immediately, but we will respond.

> [!WARNING]
> This is **not** an open-source project in the traditional sense. The
> code is source-available under a non-commercial license. See
> [LICENSE](./LICENSE) before you contribute — by opening a pull
> request, you agree to those terms.

> [!IMPORTANT]
> All contributors must read and follow the
> [Code of Conduct](./CODE_OF_CONDUCT.md). It is not optional.

---

## Ways to contribute

You don't have to write code. Here are all the valid ways to help:

- **Report a bug** — open an issue with a clear reproduction
- **Suggest a feature** — open an issue describing the idea and why
- **Fix a typo** — small pull requests are welcome
- **Improve accessibility** — keyboard navigation, screen reader,
  contrast, reduced motion
- **Improve performance** — file size, lazy loading, render time
- **Improve documentation** — README, CREDITS, comments in code
- **Translate** — if you want to add a non-English locale, ask first
- **Design** — icons, illustrations, preview images
- **Write** — if you want to add a note to the Notes page, ask first

---

## Before you start

> [!WARNING]
> Do **not** open a pull request for a large feature without discussing
> it first. We are a small team, and unreviewed large changes take a
> long time to triage. Open an issue first, describe what you want to
> build, and wait for a reply.

For small things (typos, small bug fixes, obvious accessibility issues),
you can skip the discussion and go straight to a pull request.

---

## Setting up locally

See the "Run it" section of the [README](./README.md). In short:

```sh
python -m http.server 8000
```

or

```sh
npx serve .
```

Then open `http://localhost:8000`.

> [!NOTE]
> There is no build step. No `npm install`. No bundler. Just HTML,
> CSS, and vanilla JavaScript. If your change requires a build step,
> it will not be accepted — the project is intentionally simple.

---

## Branching and commits

### Branch naming

Use short, descriptive branch names:

- `fix/menu-focus-trap`
- `feat/note-rss-feed`
- `docs/readme-previews`
- `chore/update-deps`

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/).
Prefix your commit with one of:

| Prefix | Use for |
|--------|---------|
| `feat:` | a new feature |
| `fix:` | a bug fix |
| `docs:` | documentation only |
| `style:` | CSS, formatting, no logic change |
| `refactor:` | code change with no feature or fix |
| `perf:` | performance improvement |
| `test:` | adding or fixing tests |
| `chore:` | tooling, config, dependencies |
| `assets:` | images, videos, fonts |

Examples:

```
feat: add RSS feed for notes
fix: prevent horizontal scroll on mobile tab-rail
docs: add contributing guide
style: improve focus ring contrast
```

> [!TIP]
> Write the commit message as if completing the sentence:
> "If applied, this commit will…" — that's the right tone.

---

## Pull request process

1. **Fork** the repository
2. **Create a branch** from `main` (see naming above)
3. **Make your change** — keep it focused on one thing
4. **Test locally** — open every page that your change touches
5. **Push** to your fork
6. **Open a pull request** against `main`

In your pull request description, include:

- **What** the change does
- **Why** you made it
- **How** to test it
- Screenshots or a short screen recording (for visual changes)

> [!IMPORTANT]
> Your pull request must not break any of the following:
>
> - Keyboard navigation on any page
> - Screen reader announcements for interactive elements
> - The reduced-motion experience
> - The low-data mode toggle
> - The day/night theme toggle
> - The mobile layout at 360px width
>
> If your change does affect one of these, describe it in the PR and
> explain why it's acceptable.

---

## Code style

### JavaScript

- Use **ES modules** (`import` / `export`)
- Use `const` and `let` — never `var`
- Prefer `async` / `await` over `.then()` chains
- Wrap storage access in `try` / `catch`
- Use `textContent`, not `innerHTML`, for user-provided strings
- Escape HTML with `escapeHtml()` from `js/utils.js`
- No dependencies. If you need something, write it small.

### CSS

- Use **design tokens** from `css/tokens.css` — no hardcoded colors
- Use `clamp()` for fluid sizes
- Prefer `var(--space-*)` over magic numbers
- Every interactive element needs a `:focus-visible` state
- Respect `@media (prefers-reduced-motion: reduce)`
- No preprocessors. No `@apply`. Plain CSS only.

### HTML

- Use semantic elements (`<nav>`, `<main>`, `<article>`, `<button>`)
- Every image has an `alt` attribute
- Every interactive element has an accessible name
- Use `<button type="button">` unless inside a form
- Use `<noscript>` fallbacks where JS is required

> [!WARNING]
> We do **not** use frameworks. If your contribution adds React, Vue,
> Svelte, Tailwind, or any similar dependency, it will be declined. The
> point of this project is that it's plain and hand-written.

---

## Testing checklist

Before submitting a pull request, run through this:

- [ ] Every page opens without console errors
- [ ] The menu opens, closes, and traps focus correctly
- [ ] Tab navigation works — every interactive element is reachable
- [ ] The theme toggle persists across reloads
- [ ] Low-data mode pauses videos
- [ ] The mobile layout works at 360px
- [ ] No horizontal scroll on any page
- [ ] Reduced-motion mode has no animation

> [!NOTE]
> There is no automated test suite. Testing is manual. If you want to
> add a test suite, open an issue first — we want to keep the project
> buildless, so any test setup must work without `npm install`.

---

## Reporting bugs

When opening a bug report, include:

- **What you did** (steps)
- **What you expected** (the desired result)
- **What actually happened** (the real result)
- **Browser and version** (e.g. Chrome 122 on Windows 11)
- **A screenshot or short video** if it's visual

> [!TIP]
> If you can reproduce the bug on a live page, include the URL. If the
> bug is only reproducible on a specific device, mention the device and
> OS version.

---

## Suggesting features

Feature suggestions are welcome, but please understand that we ship
small and rarely. Before suggesting:

- Read the existing [issues](https://github.com/daddymaou/sparts/issues)
  — someone may have already asked
- Explain **why** the feature matters to the site's purpose
- If you can, suggest the **simplest possible** implementation

> [!NOTE]
> We're more likely to accept a feature if it fits the tone of the site:
> playful, lightweight, honest, and not trying to be a startup.

---

## What we won't accept

To save everyone time, here's what will be closed without discussion:

- Adding a framework, bundler, or build step
- Adding analytics, trackers, or third-party scripts
- Adding a backend
- Rewriting the design system
- Renaming the project or brand
- Changes to `LICENSE` or `CODE_OF_CONDUCT.md`
- Pull requests that are mostly AI-generated without a human who
  understands them

> [!CAUTION]
> Any pull request that tries to add tracking, telemetry, or analytics
> will be closed immediately. This site has none, and it never will.

---

## Questions?

If anything here is unclear, open an issue with the label `question`.
We'd rather answer a question than review a confusing pull request.

Thanks for reading. Now go build something work-ish.