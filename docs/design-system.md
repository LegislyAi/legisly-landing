# Legisly Design System — Tangerine + Grotesque

For all frontend and UI work, follow the design system defined here. The
authoritative values are the `:root` variables in `styles.css`; this doc
describes how to use them. If the two disagree, `styles.css` wins — update
this doc to match.

## Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| --primary | #F26419 | Brand orange — CTAs, links, accents, active nav |
| --primary-2 | #FF8A3D | Lighter orange, gradients, hovers |
| --primary-soft | #FFE0CC | Soft orange backgrounds, pills |
| --accent | #06B6A4 | Teal accent — eyebrows, kickers, AI callouts |
| --accent-soft | #C6F4EE | Soft teal backgrounds |
| --assembly | #1FA85F | Green — Assembly-related UI, vote callouts |
| --senate | #EE4B4B | Red — Senate-related UI, live indicators |
| --gold | #F2C744 | Highlights (`.hl`), badges, trust pins |
| --hero-a / --hero-b | #FF7A2F / #FFB347 | Hero/CTA gradient endpoints |
| --bg | #FFF6EC | Warm cream page background |
| --surface / --surface-2 | #FFFFFF / #FFF9F2 | Card and panel backgrounds |
| --ink / --text / --muted | #2A1D14 / #3A2A1F / #8A7160 | Text colors (warm browns) |
| --border | #F0DEC9 | 1px borders on cards, nav, inputs |
| --dark / --dark-2 | #231712 / #2E2018 | Dark sections (footer) |

Each accent color has a `-soft` pair for tinted backgrounds; use
`color-mix(in srgb, var(--x) N%, ...)` for in-between tints.

## Typography

- Headings / display (`--display`): Bricolage Grotesque (400–800), tight letter-spacing (-.02em)
- Body / UI (`--body`): Hanken Grotesk (400–800)
- Headline sizes use `clamp()` for fluid scaling

## Key Rules

- Rounded corners everywhere: `--radius` (18px) for cards, `--radius-sm` (12px) for smaller elements, `border-radius:999px` for pills
- Borders are 1px solid `--border`
- Shadows are warm-toned (`--shadow`, `--shadow-lift`) — never gray-blue
- Hover lift pattern: `transform:translateY(-2px)` (buttons) or `-5px` (cards) plus `--shadow-lift`
- Scroll-in animation: add `.reveal` class; the per-page IntersectionObserver script adds `.in`
- Sentence case headlines (no uppercase except `.kicker` labels)

## Icons

Never use emoji or text glyphs (▤ ◉ ✦ 🔐 …) as feature icons. The icon set in
`icons.svg` is adapted from Lucide v1.17 (ISC license, lucide.dev) and
remastered as duotone: strokes inherit `currentColor`; chosen detail sub-paths
(the check, the dot, the spark) use `var(--ico-accent)` as the second color.

Usage — `icons.svg` is the source of truth, but it is **inlined as a hidden
`<svg>` right after `<body>`** on every page that uses icons (index, about,
careers, security, blog). Never load it with fetch() or external
`<use href="file#id">` — both break on file:// and older Safari. When icons.svg
changes, re-sync the inlined copy on those pages. Reference symbols
same-document:

```html
<div class="ic ic-primary"><svg class="ico" aria-hidden="true"><use href="#i-bill"/></svg></div>
```

Tint plates (defined in styles.css): `.ic-primary` (orange/teal accent),
`.ic-ai` (teal/orange), `.ic-live` (red/gold), `.ic-green` (green/orange),
`.ic-gold` (gold/orange). Cards animate the plate on hover
(`scale(1.1) rotate(-5deg)` with the `--spring` easing).

Available symbols: i-bill, i-live, i-report, i-users, i-calendar, i-sparkle,
i-scale, i-bolt, i-heart, i-cycle, i-globe, i-rocket, i-bulb, i-chart-up,
i-cpu, i-pie, i-lock, i-server, i-key, i-activity, i-shield, i-target, i-bell.
Add new icons to icons.svg following the same grid/stroke/accent rules.

## Motion

- Stacked warm shadows (`--shadow`, `--shadow-lift`): hairline ring + contact
  + ambient. Never a single heavy drop.
- Hero atmosphere: blurred aurora blobs (`.hero::before`, drifting 16s loop) —
  warm orange/amber dominant, teal kept faint (≤14%) so the cream never reads
  muddy. Gradient headline accent via `background-clip:text` on `.pop`.
- The "FIRST 20 FREE" badge is an organic ink-stamp SVG (wobbly blob + dashed
  ring + satellite droplets) with a delayed "thunk" entrance (`stamp`
  keyframes). Promotional badges should use this stamped-ink language, not
  plain circles.
- Primary buttons carry a hover sheen sweep (`.btn.primary::after`).
- Buttons: hover = `translateY(-2px)` + lift shadow; press = `scale(.97)`.
- Cards: hover = lift + orange-tinted border + 3px gradient top hairline
  (`::before`) + icon plate spring.
- Scroll reveals via `.reveal`; hero uses the `rise` entrance choreography
  (staggered 80ms delays).
- `--spring` (`cubic-bezier(.34,1.4,.5,1)`) is the standard overshoot easing
  for icon/ornament micro-interactions.
- All motion is disabled under `prefers-reduced-motion` (handled globally in
  styles.css — never add an animation outside that guard's reach).
- Keyboard focus uses the global `:focus-visible` orange outline.

## Brand Assets (Logo)

The mark is an orange rounded square (`--primary`) with a dotted dome arch —
six cream dots (`--bg`), a teal apex dot (`--accent`) — over a cream baseline.

Source-of-truth files (repo root):

| File | What it is | Use |
|------|-----------|-----|
| logo-mark.svg | Vector mark, transparent rounded square | Nav/footer `<img class="mark">`, in-page use; same artwork as favicon.svg |
| logo-icon.png | 1024×1024 raster mark, transparent corners | Source for all raster derivatives |
| logo-lockup-light.png | Horizontal lockup + "Know everything." tagline, for light backgrounds | Marketing, og-image source |
| logo-lockup-dark.png | Same lockup recolored for dark backgrounds | Dark surfaces (e.g. footer-style sections) |

Derivatives regenerated from these (keep filenames stable — referenced by every
page `<head>` and possibly hot-linked externally): favicon.svg, favicon.ico,
favicon-32.png, favicon-192.png, favicon.png, apple-touch-icon.png (full-bleed
orange — iOS applies its own mask), og-image.png/.jpg (1200×630, lockup on
cream), logo.png, logo-small.png, logo-transparent.png/.svg,
logo-social-square.png/.svg, logo-x-400.png, logo-linkedin-300.png.

Usage rules:
- In the nav/footer the mark is `<img class="mark" src="logo-mark.svg" alt="" width="38" height="38">` followed by the "legisly" wordmark as text — keep `alt=""` (the link text names it).
- In both nav and footer, the badge under the wordmark (`.est`) carries the brand tagline "Know everything." — mark + wordmark + tagline echoes the horizontal lockup, in live text. Don't put the lockup PNGs in page chrome (the tagline is illegible at nav size); they're for large surfaces: og-image, decks, marketing.
- `.logo .mark` CSS uses `border-radius:21%` to match the artwork's baked corner radius so `--shadow` hugs the icon.
- Never redraw the mark with CSS; always use logo-mark.svg.
