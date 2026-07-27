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

- **Each page is a standalone HTML file** (index, features, pricing, how-it-works, about, faq, contact, blog, careers, security, privacy, terms, thank-you, 404). There are no includes or templating: the nav and footer **markup** is duplicated in every page, so a change to either must be replicated across all of them. Shared *behaviour* is not duplicated — it lives in `site.js`.
- **site.js** is loaded with `defer` by every page and owns the mobile-nav toggle, the IntersectionObserver `.reveal` animation, and the hand-off links into the product app. Page-specific scripts (the legal-page TOC scroll-spy and back-to-top in privacy/terms) stay inline in those pages.
- **styles.css** is the shared stylesheet for all pages and the source of truth for the design system ("Tangerine + Grotesque"); all design tokens live in its `:root` block. Page-specific styles go in an inline `<style>` block in each page's `<head>`.
- **Product app hand-off:** the app lives at `https://d1v7uf95aw2lbq.cloudfront.net` (`/auth/register`, `/auth/login`). `APP_ORIGIN` in `site.js` is the single source of truth — change it there on a domain move. Every CTA still ships a working absolute `href` in markup as the no-JS fallback; `site.js` only decorates it. Mark up links as `data-app="register|login"`, optionally with `data-plan="core|intelligence"` for pricing preselection, and GET forms as `data-app-form="register"`. Attribution (`utm_*`, `gclid`, plus a `ref` naming the page) is merged in automatically, and inbound ad UTMs win over the site's own defaults.
- **Nav CTAs:** every page's nav ends with the same pair — a muted `.nav-login` text link and the orange `.nav-cta` "Start free trial" button.
- **Forms:** the contact form and the blog newsletter POST to Formspree (`https://formspree.io/f/mdalewlb`) with a hidden `_next` redirecting to thank-you.html. The homepage signup is **not** Formspree — it is a native `method="get"` form pointed at the app's register route, so the typed email arrives as `?email=` with no JS involved.
- **Brand assets:** `logo-mark.svg` (vector mark, used in nav/footer of every page) and `logo-icon.png`/`logo-lockup-*.png` are the logo sources; every other logo/favicon/og-image file is a derivative regenerated from them — keep filenames stable (referenced in every page `<head>` and possibly hot-linked externally). See "Brand Assets" in docs/design-system.md.
- **Icons:** `icons.svg` is a duotone SVG sprite (Lucide-derived, ISC; no emoji/glyph icons). It is **inlined after `<body>`** on each page that uses icons and referenced with `<use href="#i-name">` — never loaded via fetch or external `use` (breaks on file:// and older Safari). When icons.svg changes, re-sync the inlined copies. See "Icons" in docs/design-system.md.
- **Demo booking:** the Calendly link (`https://calendly.com/legislyca/legisly-demo?month=2026-06`) appears in the hero CTA (index), features nav CTA, contact info card, index CTA card, and every footer's Product column — always with `target="_blank" rel="noopener"`.
- **Not part of the live site:** `retro.css` (previous design, referenced by no page), `legisly-landing new.html`, and `hero-options-preview.html` (self-contained design explorations).

## Design system

For all frontend and UI work, follow the design system in docs/design-system.md. If it ever disagrees with `styles.css`, the `:root` variables in `styles.css` win — update the doc to match.

Key conventions: Bricolage Grotesque for headings (`--display`), Hanken Grotesk for body (`--body`), orange `--primary` (#F26419) as the brand color, warm cream backgrounds, rounded corners via `--radius`/`--radius-sm`, and warm-toned (never gray-blue) shadows via `--shadow`/`--shadow-lift`.
