# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for Legisly (legisly.ai) — AI legislative intelligence for California lobbying firms. Plain HTML/CSS with small inline vanilla-JS snippets. No build system, no package.json, no tests, no framework.

## Development

There is no build or lint step. Preview locally with:

```bash
python3 -m http.server 8000
```

Deployment is GitHub Pages from `main` (CNAME → legisly.ai). Merging to `main` publishes the site.

## Architecture

- **Each page is a standalone HTML file** (index, features, pricing, how-it-works, about, faq, contact, blog, careers, security, privacy, terms, thank-you). There are no includes or templating: the nav, footer, mobile-nav toggle script, and IntersectionObserver `.reveal` animation script are **duplicated in every page**. A change to shared chrome (nav links, footer, scripts) must be replicated across all pages — and recent history shows this is a common task.
- **styles.css** is the shared stylesheet for all pages and the source of truth for the design system ("Tangerine + Grotesque"); all design tokens live in its `:root` block. Page-specific styles go in an inline `<style>` block in each page's `<head>`.
- **Forms** (contact page, homepage subscribe) POST to Formspree (`https://formspree.io/f/mdalewlb`) with a hidden `_next` field redirecting to thank-you.html.
- **Brand assets:** `logo-mark.svg` (vector mark, used in nav/footer of every page) and `logo-icon.png`/`logo-lockup-*.png` are the logo sources; every other logo/favicon/og-image file is a derivative regenerated from them — keep filenames stable (referenced in every page `<head>` and possibly hot-linked externally). See "Brand Assets" in docs/design-system.md.
- **Icons:** `icons.svg` is a duotone SVG sprite (Lucide-derived, ISC; no emoji/glyph icons). It is **inlined after `<body>`** on each page that uses icons and referenced with `<use href="#i-name">` — never loaded via fetch or external `use` (breaks on file:// and older Safari). When icons.svg changes, re-sync the inlined copies. See "Icons" in docs/design-system.md.
- **Demo booking:** the Calendly link (`https://calendly.com/legislyca/legisly-demo?month=2026-06`) appears in the hero CTA (index), features nav CTA, contact info card, index CTA card, and every footer's Product column — always with `target="_blank" rel="noopener"`.
- **Not part of the live site:** `retro.css` (previous design, referenced by no page), `legisly-landing new.html`, and `hero-options-preview.html` (self-contained design explorations).

## Design system

For all frontend and UI work, follow the design system in docs/design-system.md. If it ever disagrees with `styles.css`, the `:root` variables in `styles.css` win — update the doc to match.

Key conventions: Bricolage Grotesque for headings (`--display`), Hanken Grotesk for body (`--body`), orange `--primary` (#F26419) as the brand color, warm cream backgrounds, rounded corners via `--radius`/`--radius-sm`, and warm-toned (never gray-blue) shadows via `--shadow`/`--shadow-lift`.
