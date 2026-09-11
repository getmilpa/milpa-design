# Milpa Design — how to build with it (read this first)

**This is a CSS-only design system. There are NO React components.** `window.MilpaDesign` exports only `motion` (a GSAP timing config) — ignore the generated "Components are then available at `window.MilpaDesign.*`" boilerplate below; there is nothing to import or mount. Build every screen from plain JSX elements (`<button>`, `<div>`, `<section>`, `<dialog>`, `<table>`…) carrying Milpa's `mui-*` classes. Never invent a class name: every valid one is documented in `guidelines/milpa-contracts/` (one doc per component, with verbatim HTML examples) — start at `guidelines/milpa-contracts/catalog.md`.

## Setup (mandatory)

- Link `styles.css` once. It pulls the tokens, the Google Fonts import (Space Grotesk / Space Mono) and all component CSS.
- Put `data-theme="dark"` or `data-theme="light"` on `<html>` (or on the outermost element you control). Without it you get dark — Milpa is dark-first.
- Page skeleton: `<div class="mui-page">` → `<section class="mui-section">` → `<div class="mui-container">`. Admin apps: `<div class="mui-shell">` with `.mui-sidebar` + `.mui-topbar` + `<main class="mui-shell__main">`.

## The idiom: `block__element--modifier` classes

One family per component (`.mui-btn`, `.mui-card`…); parts use `__` (`.mui-card__header`), variants use `--` (`.mui-btn--primary`). States are **attributes, not classes**: `[disabled]`, `[aria-busy="true"]`, `[aria-current="page"]`, `[aria-selected="true"]`, `[aria-invalid="true"]` — each contract's **States** section lists them.

| need | classes |
|---|---|
| layout | `.mui-container` (`--narrow`, `--wide`) · `.mui-section` (`--tight`, `--flush`; `__kicker`, `__title`, `__lede`) · `.mui-stack` (`--sm`, `--lg`) · `.mui-cluster` (`--sm`, `--lg`) |
| actions | `.mui-btn` + `--primary` (ONE per view) / `--secondary` / `--subtle` / `--danger` / `--ghost`; sizes `--sm` `--lg`; `--icon` (needs `aria-label`), `--full` |
| surfaces | `.mui-card` (`--raised`, `--compact`, `--interactive`; `__header` `__title` `__body` `__footer` `__media`) |
| forms | `.mui-field` (`__label` `__hint` `__error` `__required`; `--row`) wrapping `.mui-input` / `.mui-select` / `.mui-textarea` / `.mui-checkbox` / `.mui-radio` / `.mui-switch` (`--sm` `--lg` on input/select) |
| status | `.mui-badge` (`--accent` `--secondary` `--success` `--warning` `--danger` `--info` `--dot`) · `.mui-alert` (`--info` `--success` `--warning` `--danger`; `__icon` `__content` `__title` `__desc` `__actions` `__dismiss`) |
| data | `.mui-table` (`--compact`; `__num` `__lead` `__actions` `__sort` `__check`) inside `.mui-table-wrap` · `.mui-stat` (`__label` `__value` `__delta` + `--up`/`--down`) · `.mui-empty` · `.mui-skeleton` · `.mui-progress` |
| nav | `.mui-tabs` (`__tab` `__panel`; `--pill`) · `.mui-breadcrumbs` · `.mui-pagination` · `.mui-sidebar` (`__nav` `__section` `__item`) · `.mui-topbar` |
| overlays | `<dialog class="mui-modal">` (`__header` `__title` `__body` `__footer`; `--danger`) · `<dialog class="mui-drawer">` (`--start`, `--docked`) — open with `showModal()` · `.mui-menu` · `.mui-toast` · `.mui-tooltip` |
| marketing | `.mui-header` (`__brand` `__nav` `__actions`; `--overlay`) · `.mui-hero` (`__kicker` `__title` `__tagline` `__sub` `__cta` `__meta` `__media`; `--center`) · `.mui-feature-grid` · `.mui-pricing` · `.mui-faq` · `.mui-testimonial` · `.mui-cta-band` · `.mui-footer` |
| content | `.mui-prose` (rich text; `.mui-not-prose` opts out) · `.mui-code` · `.mui-code-group` · `.mui-terminal` · `.mui-callout` · `.mui-quote` · `.mui-steps` · `.mui-chart` |

## Your own layout glue: tokens only

For anything no class covers, write inline styles or a few CSS rules using `var(--*)` — never hard-coded colors, px spacing or font names:

- color: `--bg` `--surface` `--surface-raised` `--overlay` `--text` `--text-secondary` `--text-muted` `--border` `--border-subtle` `--border-strong` `--accent` `--accent-text` `--secondary` `--secondary-text` `--success` `--warning` `--danger` `--info` `--focus`
- space: `--space-1` … `--space-32` (4px base: `--space-1`=.25rem, `--space-4`=1rem, `--space-8`=2rem) · radius: `--radius-sm` `--radius-base` `--radius-md` `--radius-lg` `--radius-full` · shadow: `--shadow-sm` `--shadow-base` `--shadow-md` `--shadow-lg`
- type: `--font-heading` `--font-body` `--font-mono`; sizes `--text-2xs` … `--text-6xl`; weights `--weight-regular` `--weight-medium` `--weight-semibold` `--weight-bold`
- motion: `--dur-fast` `--dur-base` `--dur-slow` with `--ease-standard` / `--ease-settle` — things *germinate and settle*, never bounce

Palette ramps (`--oro-*` gold accent, `--olivo-*` olive secondary, `--tierra-*` earth neutral, `--cielo-*` sky/info) exist, but prefer the semantic tokens above — they flip correctly between dark and light.

## Where the truth lives

`styles.css` → `tokens/milpa-tokens.css` (every token, dark + light values) and `_ds_bundle.css` (every `mui-*` rule). Per component: `guidelines/milpa-contracts/<layer>/<name>.md` (anatomy, modifiers, states, a11y, verbatim examples). Philosophy and anti-patterns: `guidelines/DESIGN.md` (dark-first, geometric, warm; no literal folklore, no noisy gradients, no dramatic shadows). Theming/skins: `guidelines/THEMING.md`.

## Idiomatic snippet

```jsx
<div className="mui-page">
  <section className="mui-section">
    <div className="mui-container">
      <p className="mui-section__kicker">cosecha</p>
      <h1 className="mui-section__title">Backups</h1>
      <div className="mui-cluster" style={{ marginTop: 'var(--space-6)' }}>
        <div className="mui-stat">
          <span className="mui-stat__label">Snapshots</span>
          <span className="mui-stat__value">1,284</span>
          <span className="mui-stat__delta mui-stat__delta--up">+12%</span>
        </div>
      </div>
      <div className="mui-card mui-card--raised" style={{ marginTop: 'var(--space-8)' }}>
        <div className="mui-card__header"><h2 className="mui-card__title">Nuevo snapshot</h2></div>
        <div className="mui-card__body">
          <div className="mui-field">
            <label className="mui-field__label" htmlFor="name">Nombre</label>
            <input id="name" className="mui-input" />
          </div>
        </div>
        <div className="mui-card__footer mui-cluster">
          <button type="button" className="mui-btn">Cancelar</button>
          <button type="button" className="mui-btn mui-btn--primary">Sembrar</button>
        </div>
      </div>
    </div>
  </section>
</div>
```
