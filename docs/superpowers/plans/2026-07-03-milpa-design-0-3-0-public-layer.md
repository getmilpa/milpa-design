# Milpa Design 0.3.0 «la plaza» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public-facing layer of the Milpa design system — a shared `mui-header`, content/media pieces (`mui-card__media`, `mui-byline`, `:is(img,svg,picture)` media slots), and a hardened `@layer` gate — as `@milpa/design@0.3.0`.

**Architecture:** Extend the existing hand-authored bundles (no new CSS bundle, no new export). `mui-header` joins `layouts/milpa-layouts.css` (`@layer milpa.layouts`); `mui-card__media` and `mui-byline` join `components/milpa-components.css` (`@layer milpa.components`). Each piece ships a `*.contract.json`. The gate gains a real brace-walk that proves every rule lives inside its declared layer. Six proofs migrate off their bespoke headers.

**Tech Stack:** Pure CSS (cascade layers, custom properties, ARIA/native-attribute state), zero-dependency Node ESM scripts (`node:assert` for the one unit test), inline JS in proofs only.

## Global Constraints

- Every published CSS file declares the canonical `@layer` order (single source: `scripts/contrast-pairs.mjs` → `LAYER_ORDER`) and wraps ALL its rules in its own layer. Un-layered consumer CSS must always win.
- State is styled via ARIA/native attributes, never `.is-*` classes. Presentational scroll state uses `[data-scrolled]`; off-canvas uses `[data-nav-open]` on the root + `aria-expanded` on the toggle.
- Closed palette: reuse existing semantic tokens; add none. Components consume semantic tokens only (no `oro/olivo/tierra/cielo/success/warning/danger-<n>` ramps, no literal colors, no `!important`, no raw `z-index`, no hardcoded durations).
- Zero published JS: behavior lives in each contract's `a11y.behavior`; demo JS lives only in proofs.
- Quality floor: AA contrast (4.5 text / 3:1 UI), light/dark parity, reduced-motion parity, keyboard-navigable with `:focus-visible`, correct `aria-*`. `<html>` always carries `data-theme`.
- Adding/changing a piece = a `*.contract.json` (required fields: `name, layer, version, class, summary, states, tokens, a11y`) + any new AA pair to `scripts/contrast-pairs.mjs`.
- Naming: classes `mui-*`; contracts `{component}.contract.json`; `version` field of new/updated contracts = `"0.3.0"`.
- Commits by explicit path (never `git commit -a`), unsigned (`git -c commit.gpgsign=false`) to match 0.2.0 and avoid the pinentry hang.
- Verification: `npm test` (contrast + governance + drift) must stay green; `npm run verify:theme -- proof/themed-skin.css` must stay green; migrated proofs verified in-browser dark/light/mobile/keyboard/console.

---

## Task 1 (E1): Harden the `@layer` gate with a brace-walk

**Why first:** this gate guards the theming invariant that every later CSS task depends on. `verify-governance.mjs` runs its checks and calls `process.exit` at import time, so the brace-walk logic must live in a side-effect-free module (the `contrast-pairs.mjs` pattern) to be unit-testable.

**Files:**
- Create: `scripts/layer-guard.mjs`
- Create: `scripts/layer-guard.test.mjs`
- Modify: `scripts/verify-governance.mjs:71-77`

**Interfaces:**
- Produces: `firstUnlayeredRule(rawCss: string, layerName: string) → string` — returns the offending leftover CSS (a rule outside the file's declared layer) or `''` when every rule is layered. `layerName` is e.g. `'milpa.layouts'`.

- [ ] **Step 1: Write the failing test**

Create `scripts/layer-guard.test.mjs`:

```js
import assert from 'node:assert/strict';
import { firstUnlayeredRule } from './layer-guard.mjs';

const ORDER = '@layer milpa.tokens, milpa.components, milpa.layouts;';

// positive: everything wrapped → no leftover
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts {\n  .a { color: var(--text); }\n}`, 'milpa.layouts'),
  '',
  'fully-wrapped file should report no unlayered rule',
);

// nested @media inside the layer is still "inside"
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts {\n  @media (max-width: 880px) { .a { color: var(--text); } }\n}`, 'milpa.layouts'),
  '',
  'rules under @media inside the layer are layered',
);

// reopened layer (two blocks) is legal — both are inside
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts { .a{color:var(--text)} }\n@layer milpa.layouts { .b{color:var(--text)} }`, 'milpa.layouts'),
  '',
  'a reopened @layer block is still inside the layer',
);

// negative: a rule after the closing brace leaks un-layered
const leaked = firstUnlayeredRule(
  `${ORDER}\n@layer milpa.layouts { .a{color:var(--text)} }\n.leaked { color: var(--text); }`,
  'milpa.layouts',
);
assert.ok(leaked.includes('.leaked'), 'a rule outside the layer must be reported');

// braces inside comments/strings must not fool the walk
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts { .a::before{content:"}"} /* } */ }`, 'milpa.layouts'),
  '',
  'braces in strings/comments are ignored',
);

console.log('layer-guard: ALL PASS');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/layer-guard.test.mjs`
Expected: FAIL — `Cannot find module '.../scripts/layer-guard.mjs'`.

- [ ] **Step 3: Implement the module**

Create `scripts/layer-guard.mjs`:

```js
/**
 * layer-guard.mjs — side-effect-free brace-walk for the @layer gate.
 * Confirms EVERY style rule in a published CSS file lives inside its own
 * `@layer <name> { … }` wrapper. A substring check only proves the wrapper
 * exists; this proves nothing leaked out after a closing brace.
 * Zero deps, no top-level side effects (so verify-governance.mjs can import it
 * without triggering its process.exit — same reason LAYER_ORDER lives apart).
 */
const stripInert = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')                 // comments
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""'); // string contents

/** Returns leftover CSS containing an unlayered rule, or '' if all rules are layered. */
export function firstUnlayeredRule(rawCss, layerName) {
  let css = stripInert(rawCss);
  const marker = `@layer ${layerName} {`;
  // remove each balanced `@layer <name> { … }` block (a layer may be reopened)
  let idx;
  while ((idx = css.indexOf(marker)) !== -1) {
    let depth = 0, end = -1;
    for (let i = idx + marker.length - 1; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) { end = i; break; }
    }
    if (end === -1) return '<<unbalanced @layer block>>';
    css = css.slice(0, idx) + css.slice(end + 1);
  }
  // allowed at depth 0: @layer statement list, @import, @charset (all end in ;)
  css = css.replace(/@(?:layer|import|charset)\b[^;{}]*;/g, '');
  // any remaining brace means a style/at-rule block lives outside the layer
  return css.includes('{') ? css.trim() : '';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node scripts/layer-guard.test.mjs`
Expected: `layer-guard: ALL PASS`.

- [ ] **Step 5: Integrate into the governance gate**

In `scripts/verify-governance.mjs`, add to the imports (line 11 area):

```js
import { firstUnlayeredRule } from './layer-guard.mjs';
```

Replace the `@layer` wrap check (currently lines 73-77) with:

```js
for (const [file, layer] of Object.entries(LAYERED)) {
  const raw = readFileSync(join(root, file), 'utf8');
  raw.includes(LAYER_ORDER) ? pass(`${file}: declara el orden canónico`) : fail(`${file}: falta la declaración @layer canónica`);
  const leftover = firstUnlayeredRule(raw, layer);
  leftover === '' ? pass(`${file}: toda regla vive dentro de @layer ${layer}`)
                  : fail(`${file}: regla FUERA de @layer ${layer} → ${leftover.slice(0, 80)}…`);
}
```

- [ ] **Step 6: Run the full gate to confirm nothing regressed**

Run: `npm test`
Expected: PASS — every published file reports "toda regla vive dentro de @layer …" and the run ends `ALL PASS ✓`.

- [ ] **Step 7: Commit**

```bash
git add scripts/layer-guard.mjs scripts/layer-guard.test.mjs scripts/verify-governance.mjs
git -c commit.gpgsign=false commit -m "test(gate): brace-walk @layer check — cazar reglas fuera de capa

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 2 (A1): `mui-header` CSS + contract

**Files:**
- Modify: `layouts/milpa-layouts.css` (append a new `mui-header` cluster INSIDE the existing `@layer milpa.layouts { … }` wrapper, before its closing brace)
- Create: `layouts/milpa-header.contract.json`

**Interfaces:**
- Produces: classes `.mui-header`, `.mui-header__row`, `.mui-header__brand`, `.mui-header__nav`, `.mui-header__actions`, `.mui-header__toggle`, `.mui-header__scrim`; variant `.mui-header--overlay`; state hooks `.mui-header[data-nav-open]`, `.mui-header--overlay[data-scrolled]`.

- [ ] **Step 1: Add the `mui-header` CSS**

Locate the closing brace of the `@layer milpa.layouts { … }` wrapper in `layouts/milpa-layouts.css` (the final `}` of the file's layer block). Insert this cluster immediately before it, so every rule stays inside the layer (Task 1's gate now enforces this):

```css
/* ════════════════════════════════════════════════════════════════════
   cluster · header  (la plaza — el header público / marketing)
   Tercer header del sistema, distinto de mui-topbar (admin) y
   mui-docs__topbar (docs). Barra sólida sticky + off-canvas móvil
   (patrón EXACTO del shell docs: [data-nav-open] en el root, aria-expanded
   en el toggle) + variante overlay sobre hero.
   ════════════════════════════════════════════════════════════════════ */
.mui-header {
  position: sticky; top: 0; z-index: var(--z-sticky);
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-block-end: 1px solid var(--border-subtle);
}
.mui-header__row {
  display: flex; align-items: center; gap: var(--space-4);
  min-height: 3.5rem;
}
.mui-header__brand {
  display: inline-flex; align-items: center; gap: var(--space-2);
  color: var(--text); text-decoration: none;
}
.mui-header__nav {
  margin-inline-start: auto;
  display: flex; align-items: center; gap: var(--space-1);
}
.mui-header__actions {
  display: flex; align-items: center; gap: var(--space-2);
}
/* con nav a la derecha, las actions no reclaman el margin-auto */
.mui-header__nav + .mui-header__actions { margin-inline-start: var(--space-2); }
.mui-header__toggle { display: none; }
.mui-header__scrim { display: none; }

/* overlay — transparente sobre el hero; se solidifica con [data-scrolled] */
.mui-header--overlay {
  background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
  border-block-end-color: transparent;
  transition:
    background var(--dur-moderate) var(--ease-standard),
    border-color var(--dur-moderate) var(--ease-standard);
  /* reduce → dur colapsa a 1 frame por el contrato global */
}
.mui-header--overlay[data-scrolled] {
  background: color-mix(in srgb, var(--bg) 85%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-block-end-color: var(--border-subtle);
}

/* ---------- responsive ≤880px: nav → drawer off-canvas ----------
   Mismo mecanismo que mui-docs: cerrado = fuera del lienzo y fuera del
   árbol de a11y (visibility flipa al terminar el slide-out). El hook de
   layout es [data-nav-open] en .mui-header; la semántica la lleva
   aria-expanded en el toggle. El JS del consumidor alterna inert. */
@media (max-width: 880px) {
  .mui-header__toggle { display: inline-flex; }
  .mui-header__nav {
    position: fixed; inset-block: 0; inset-inline-end: 0;
    width: 16rem; margin-inline-start: 0;
    flex-direction: column; align-items: stretch; gap: var(--space-1);
    padding: calc(3.5rem + var(--space-3)) var(--space-3) var(--space-4);
    background: var(--bg);
    border-inline-start: 1px solid var(--border-subtle);
    z-index: var(--z-drawer);
    transform: translateX(100%);
    visibility: hidden;
    transition:
      transform  var(--dur-moderate) var(--ease-grano),
      visibility var(--dur-instant) var(--ease-linear) var(--dur-moderate);
  }
  .mui-header[data-nav-open] .mui-header__nav {
    transform: none; visibility: visible; box-shadow: var(--shadow-md);
    transition:
      transform  var(--dur-moderate) var(--ease-grano),
      visibility var(--dur-instant);
  }
  .mui-header[data-nav-open] .mui-header__scrim {
    display: block;
    position: fixed; inset: 0;
    z-index: var(--z-backdrop);
    background: color-mix(in srgb, var(--bg) 55%, transparent);
    animation: milpa-fade var(--dur-moderate) var(--ease-standard) both;
  }
}
```

- [ ] **Step 2: Create the contract**

Create `layouts/milpa-header.contract.json`:

```json
{
  "name": "header",
  "layer": "layout",
  "version": "0.3.0",
  "class": "mui-header",
  "summary": "Public/marketing site header: sticky bar with brand, primary nav and actions; collapses to an off-canvas panel on mobile; optional overlay variant that sits over a hero and solidifies on scroll. The third header of the system, distinct from mui-topbar (admin) and mui-docs__topbar (docs).",
  "slots": {
    "brand": ".mui-header__brand — wordmark/logo link (left)",
    "nav": ".mui-header__nav — <nav aria-label=\"primary\"> of links; becomes the off-canvas panel on mobile",
    "actions": ".mui-header__actions — buttons, theme toggle, CTA (right)",
    "toggle": ".mui-header__toggle — hamburger button; aria-expanded + aria-controls point to the nav id",
    "scrim": ".mui-header__scrim — drawer veil, visible only under [data-nav-open]"
  },
  "variants": {
    "overlay": ".mui-header--overlay — transparent over a hero; gains solid bg + border via [data-scrolled]"
  },
  "states": {
    "nav-open": "[data-nav-open] on .mui-header — off-canvas panel + scrim shown (consumer JS; the toggle carries aria-expanded)",
    "scrolled": "[data-scrolled] on .mui-header--overlay — solidified after a scroll threshold (consumer JS)"
  },
  "tokens": ["--bg", "--border-subtle", "--text", "--space-4", "--z-sticky", "--z-drawer", "--z-backdrop", "--shadow-md", "--dur-moderate", "--ease-grano"],
  "a11y": {
    "contrast": "brand/nav text is --text on a translucent --bg (gated text/bg). The overlay variant does NOT auto-guarantee AA over arbitrary hero art — see invariant.",
    "keyboard": "Tab order brand → nav → actions; the toggle opens the panel; Esc closes it. Focus moves to the first nav link on open and returns to the toggle on close.",
    "behavior": "Consumer JS toggles [data-nav-open] on .mui-header and the toggle's aria-expanded together; clicking the scrim closes; the panel gets [inert] while closed. The overlay's JS sets [data-scrolled] past a scroll threshold. Reduced-motion: transform/opacity collapse to one frame via the global contract.",
    "invariant": "The overlay variant assumes a hero dark/solid enough to keep text AA; over photographic heroes the consumer must add a scrim."
  }
}
```

- [ ] **Step 3: Run the gate**

Run: `npm test`
Expected: PASS. The new file reports "toda regla vive dentro de @layer milpa.layouts"; contract count increments by 1; if governance flags a ghost token in the contract's `tokens` array, remove that token from the array and re-run.

- [ ] **Step 4: Commit**

```bash
git add layouts/milpa-layouts.css layouts/milpa-header.contract.json
git -c commit.gpgsign=false commit -m "feat(layouts): mui-header — el header público (barra + off-canvas + overlay)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 3 (A2): Landing adopts `mui-header--overlay` (the flagship)

**Files:**
- Modify: `landing/index.html` — replace `ld-header*` markup with `mui-header`, drop the `ld-header*` CSS from the local `<style>`, add the header JS (off-canvas toggle + overlay scroll).

**Interfaces:**
- Consumes: `.mui-header*` from Task 2. Produces the reference header JS reused in Task 4.

- [ ] **Step 1: Replace the header markup**

In `landing/index.html`, replace the `<header class="ld-header">…</header>` block (currently lines 129-141) with:

```html
<header class="mui-header mui-header--overlay" id="siteHeader">
  <div class="mui-container mui-header__row">
    <a class="mui-header__brand" href="#" aria-label="Milpa — home">
      <svg class="wm" viewBox="0 0 2406.90 900.00" role="img" aria-label="milpa"><use href="#wm-milpa"/></svg>
    </a>
    <button class="mui-btn mui-btn--ghost mui-btn--icon mui-header__toggle" id="navToggle"
            type="button" aria-label="Open menu" aria-expanded="false" aria-controls="siteNav">☰</button>
    <nav class="mui-header__nav" id="siteNav" aria-label="primary">
      <a class="mui-btn mui-btn--ghost mui-btn--sm" href="/docs">Docs</a>
      <a class="mui-btn mui-btn--ghost mui-btn--sm" href="https://github.com/getmilpa/milpa-design">GitHub</a>
      <a class="mui-btn mui-btn--ghost mui-btn--sm" href="https://www.npmjs.com/package/@milpa/design">npm</a>
    </nav>
    <div class="mui-header__actions">
      <button class="mui-btn mui-btn--sm ld-mono" id="themeBtn" type="button" aria-label="Toggle theme">◐ dark</button>
    </div>
  </div>
  <div class="mui-header__scrim" id="navScrim" aria-hidden="true"></div>
</header>
```

- [ ] **Step 2: Remove the dead `ld-header*` CSS**

Delete the `/* ---- header ---- */` block from the `<style>` in `landing/index.html` (currently lines 30-41: `.ld-header`, `.ld-header__row`, `.ld-brand`, `.ld-brand .wm`, `.ld-nav`, `.ld-nav a`). The wordmark `.wm` sizing rule elsewhere in the file stays.

- [ ] **Step 3: Add the header JS**

In the landing's `<script type="module">`, after the theme block, add the reference header behavior:

```js
/* ---------- header: off-canvas + overlay ---------- */
const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
const navScrim = document.getElementById('navScrim');
const setNav = (open) => {
  header.toggleAttribute('data-nav-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  siteNav.toggleAttribute('inert', !open && matchMedia('(max-width: 880px)').matches);
  if (open) siteNav.querySelector('a')?.focus();
  else navToggle.focus();
};
navToggle.addEventListener('click', () => setNav(!header.hasAttribute('data-nav-open')));
navScrim.addEventListener('click', () => setNav(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && header.hasAttribute('data-nav-open')) setNav(false); });
// overlay solidify: [data-scrolled] once past the header's own height
const onScroll = () => header.toggleAttribute('data-scrolled', window.scrollY > header.offsetHeight);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
// closed panel starts inert on mobile
if (matchMedia('(max-width: 880px)').matches) siteNav.setAttribute('inert', '');
```

- [ ] **Step 4: Verify in the browser**

Serve (`npm run proof` if not already up) and open `http://localhost:4321/landing/index.html`. Confirm:
- Header is transparent over the hero, then gains the solid blurred bg after scrolling past it (`[data-scrolled]`).
- Toggle theme still works; light and dark both legible.
- At ≤880px: hamburger appears, opens the right-side panel with scrim, Esc/scrim close it, focus lands on the first link and returns to the toggle.
- Console: zero errors.

Use chrome-devtools `evaluate_script` to assert: `document.getElementById('siteHeader').matches('.mui-header--overlay')` is `true`, and after `window.scrollTo(0, 999)` the header has `[data-scrolled]`.

- [ ] **Step 5: Commit**

```bash
git add landing/index.html
git -c commit.gpgsign=false commit -m "feat(landing): adopt mui-header--overlay, retire ld-header

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 4 (A2): Migrate blog, saas, gallery, commerce to `mui-header`

**Files:**
- Modify: `proof/blog.html` (`blog-header*` → `mui-header`)
- Modify: `proof/saas.html` (`troje-header*` → `mui-header`)
- Modify: `proof/gallery.html` (`gal-header` → `mui-header`)
- Modify: `proof/commerce.html` (`mui-topbar` → `mui-header`)

**Interfaces:**
- Consumes: `.mui-header*` (Task 2) + the header JS (Task 3).

For EACH of the four proofs:

- [ ] **Step 1: Replace the header markup** with the `mui-header` structure (base bar, no `--overlay`), keeping that proof's own brand wordmark, nav links, and actions. Template (adjust links/actions per proof; commerce keeps its cart/search action buttons):

```html
<header class="mui-header" id="siteHeader">
  <div class="mui-container mui-header__row">
    <a class="mui-header__brand" href="/"><!-- proof's existing wordmark svg/text --></a>
    <button class="mui-btn mui-btn--ghost mui-btn--icon mui-header__toggle" id="navToggle"
            type="button" aria-label="Open menu" aria-expanded="false" aria-controls="siteNav">☰</button>
    <nav class="mui-header__nav" id="siteNav" aria-label="primary"><!-- proof's existing links --></nav>
    <div class="mui-header__actions"><!-- proof's existing actions (theme toggle, CTA, cart…) --></div>
  </div>
  <div class="mui-header__scrim" id="navScrim" aria-hidden="true"></div>
</header>
```

- [ ] **Step 2: Delete that proof's bespoke header CSS** from its local `<style>` (`blog-header*`, `troje-header*`, `gal-header*`). For `commerce.html`, remove its use of `mui-topbar` for the site header (the admin `mui-topbar` styles stay in the bundle, just unused here).

- [ ] **Step 3: Add the header JS** (identical to Task 3, Step 3) to each proof's script. If a proof has no theme toggle wiring, include only the off-canvas + overlay-less portion (drop the `data-scrolled` scroll listener since these use the base bar, not overlay).

- [ ] **Step 4: Verify each in the browser** — dark/light, ≤880px off-canvas (open/close/Esc/scrim/focus), console zero errors. Confirm the header is visually consistent across all four.

- [ ] **Step 5: Commit** (one commit for the four):

```bash
git add proof/blog.html proof/saas.html proof/gallery.html proof/commerce.html
git -c commit.gpgsign=false commit -m "feat(proof): blog/saas/gallery/commerce adopt mui-header (retire bespoke headers)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 5 (B1): `mui-card__media`

**Files:**
- Modify: `components/milpa-components.css` (append inside `@layer milpa.components`, near the `.mui-card` cluster ~line 202)
- Modify: `components/milpa-card.contract.json` (add the `__media` slot)

**Interfaces:**
- Produces: `.mui-card__media` (direct child of `.mui-card`, before `.mui-card__body`).

- [ ] **Step 1: Add the CSS**

Insert after the `.mui-card__footer` rule (after line 201) in `components/milpa-components.css`:

```css
/* media — cover edge-to-edge; el root de la card no tiene padding (vive en
   header/body/footer), así que el slot sangra solo. Redondea las esquinas
   superiores al radio de la card y recorta el medio. Ratio 16/9 por
   defecto, override con --media-ratio. */
.mui-card__media {
  overflow: hidden;
  border-start-start-radius: var(--radius-lg);
  border-start-end-radius: var(--radius-lg);
  aspect-ratio: var(--media-ratio, 16 / 9);
}
.mui-card__media > :is(img, svg, picture) {
  width: 100%; height: 100%; display: block; object-fit: cover;
}
/* si el media NO es el primer hijo (card con header arriba), no redondear */
.mui-card__header + .mui-card__media,
.mui-card__body + .mui-card__media { border-start-start-radius: 0; border-start-end-radius: 0; }
```

- [ ] **Step 2: Update the card contract**

In `components/milpa-card.contract.json`, add to the `slots` object (create the object if absent) and bump `version` to `"0.3.0"`:

```json
"media": ".mui-card__media — full-bleed cover slot (first child, before __body); clips to the card radius; inner :is(img,svg,picture) is object-fit:cover; aspect-ratio 16/9 default, override --media-ratio"
```

- [ ] **Step 3: Demo it** in `proof/blog.html` — add a `.mui-card__media` with an image (or a token-driven SVG) to an article card, before its `.mui-card__body`.

- [ ] **Step 4: Verify** — `npm test` green; in-browser the cover bleeds to the card edges, top corners match the card radius, image is not distorted; dark/light OK.

- [ ] **Step 5: Commit**

```bash
git add components/milpa-components.css components/milpa-card.contract.json proof/blog.html
git -c commit.gpgsign=false commit -m "feat(components): mui-card__media — cover edge-to-edge

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 6 (B2): `mui-byline`

**Files:**
- Modify: `components/milpa-components.css` (append inside `@layer milpa.components`)
- Create: `components/milpa-byline.contract.json`

**Interfaces:**
- Consumes: the `mui-avatar` primitive. Produces: `.mui-byline`, `.mui-byline__avatar`, `.mui-byline__text`, `.mui-byline__name`, `.mui-byline__meta`; variant `.mui-byline--sm`.

- [ ] **Step 1: Add the CSS**

Append this cluster (inside the components layer):

```css
/* ════════════════════════════════════════════════════════════════════
   cluster · byline  (autoría: avatar + nombre + meta — reusa mui-avatar)
   ════════════════════════════════════════════════════════════════════ */
.mui-byline { display: inline-flex; align-items: center; gap: var(--space-3); }
.mui-byline__avatar { flex: none; }
.mui-byline__text { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.mui-byline__name { color: var(--text); font-weight: var(--weight-medium); line-height: var(--leading-snug); }
.mui-byline__meta { color: var(--text-muted); font-size: var(--text-sm); line-height: var(--leading-snug); }
.mui-byline--sm { gap: var(--space-2); }
.mui-byline--sm .mui-byline__name { font-size: var(--text-sm); }
.mui-byline--sm .mui-byline__meta { font-size: var(--text-xs); }
```

- [ ] **Step 2: Create the contract**

Create `components/milpa-byline.contract.json`:

```json
{
  "name": "byline",
  "layer": "component",
  "version": "0.3.0",
  "class": "mui-byline",
  "summary": "Authorship line: avatar + name + meta (date · reading time · role). Reuses the mui-avatar primitive; composes into blog cards, testimonials, and any content byline.",
  "slots": {
    "avatar": ".mui-byline__avatar — wraps a mui-avatar (any size)",
    "text": ".mui-byline__text — column holding name + meta",
    "name": ".mui-byline__name — author name (--text, medium)",
    "meta": ".mui-byline__meta — muted secondary line (--text-muted, --text-sm)"
  },
  "variants": {
    "sm": ".mui-byline--sm — compact avatar + typography"
  },
  "states": {},
  "tokens": ["--text", "--text-muted", "--space-3", "--text-sm", "--text-xs", "--weight-medium"],
  "a11y": {
    "contrast": "name = --text/bg|surface, meta = --text-muted/bg|surface — all gated pairs",
    "keyboard": "presentational; any link inside (author name) uses the standard focus ring",
    "behavior": "static; no interactive state of its own"
  }
}
```

- [ ] **Step 3: Demo it** in `proof/blog.html` (article byline) and `proof/saas.html` (a testimonial), each wrapping a `mui-avatar`.

- [ ] **Step 4: Verify** — `npm test` green (note: the `states` object is empty but present, satisfying the required field); in-browser the avatar/name/meta align; dark/light OK.

- [ ] **Step 5: Commit**

```bash
git add components/milpa-components.css components/milpa-byline.contract.json proof/blog.html proof/saas.html
git -c commit.gpgsign=false commit -m "feat(components): mui-byline — línea de autoría (reusa mui-avatar)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 7 (B3): Media slots `:is(img, svg, picture)`

**Files:**
- Modify: `layouts/milpa-layouts.css:847`, `:853`, `:892`, `:938`
- Modify: `components/milpa-components.css:1088`, `:1151`, `:1219`, `:1241`
- Modify contracts: `layouts/milpa-media-grid.contract.json`, `layouts/milpa-lightbox.contract.json`, `components/milpa-product-card.contract.json`, `components/milpa-media-gallery.contract.json` (bump `version` to `"0.3.0"`; note media accepts `:is(img,svg,picture)`).

**Scope note:** the spec scopes this to product-card, media-gallery, media-grid, lightbox. `mui-hero__media img` (layouts:412) and `mui-cart-line__media img` (components:1272) are intentionally left `img`-only for now (deferred).

- [ ] **Step 1: Widen the layouts selectors**

In `layouts/milpa-layouts.css`, change each `img` to `:is(img, svg, picture)`:
- `847`: `.mui-media-grid__item img {` → `.mui-media-grid__item :is(img, svg, picture) {`
- `853`: `.mui-media-grid__item:hover img {` → `.mui-media-grid__item:hover :is(img, svg, picture) {`
- `892`: `.mui-media-grid--masonry .mui-media-grid__item img {` → `… :is(img, svg, picture) {`
- `938`: the `.mui-lightbox__media img,` selector → `.mui-lightbox__media :is(img, svg, picture),`

- [ ] **Step 2: Widen the components selectors**

In `components/milpa-components.css`:
- `1088`: `.mui-product-card__media img {` → `.mui-product-card__media :is(img, svg, picture) {`
- `1151`: `.mui-product-card[aria-disabled="true"] .mui-product-card__media img {` → `… :is(img, svg, picture) {`
- `1219`: `.mui-media-gallery__main img {` → `.mui-media-gallery__main :is(img, svg, picture) {`
- `1241`: `.mui-media-gallery__thumb img {` → `.mui-media-gallery__thumb :is(img, svg, picture) {`

- [ ] **Step 3: Update the four contracts** — bump each `version` to `"0.3.0"` and add to the media slot's description: "accepts `:is(img, svg, picture)`; token-driven SVG must carry its own viewBox/dimensioning."

- [ ] **Step 4: Demo** — in `proof/gallery.html` or `proof/commerce.html`, use a token-driven inline `<svg>` (e.g. the grain motif) as one media item and confirm it fills the slot like a raster image.

- [ ] **Step 5: Verify** — `npm test` green; in-browser the SVG media sizes correctly (object-fit/width honored); no layout shift vs `img`.

- [ ] **Step 6: Commit**

```bash
git add layouts/milpa-layouts.css components/milpa-components.css \
  layouts/milpa-media-grid.contract.json layouts/milpa-lightbox.contract.json \
  components/milpa-product-card.contract.json components/milpa-media-gallery.contract.json \
  proof/gallery.html
git -c commit.gpgsign=false commit -m "feat(media): media slots aceptan :is(img,svg,picture)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 8 (E2): Lightbox respects the active filter

**Files:**
- Modify: `layouts/milpa-lightbox.contract.json` (a11y.behavior)
- Modify: `layouts/milpa-media-grid.contract.json` (note the filter relationship)
- Modify: `proof/gallery.html` (the lightbox JS: prev/next cycle only the filtered/visible items; counter shows `n / <filtered>`)

**Interfaces:**
- Consumes: the gallery's existing filter tabs (`data-tag`) and lightbox from 0.2.0.

- [ ] **Step 1: Update the lightbox JS in `proof/gallery.html`**

Change the prev/next logic so it walks only the currently-visible (not `[hidden]`) media-grid items, and the counter reflects that filtered count. Concretely, derive the active set at open/navigate time:

```js
const visibleItems = () => [...grid.querySelectorAll('.mui-media-grid__item')].filter((el) => !el.hidden);
// on open/prev/next: index within visibleItems(); counter = `${i + 1} / ${visibleItems().length}`
```

Wire prev/next to clamp/wrap within `visibleItems()` and update the counter text accordingly.

- [ ] **Step 2: Update the contracts**

In `layouts/milpa-lightbox.contract.json` → `a11y.behavior`, add: "When driven by a filtered grid, prev/next cycle only the visible (non-[hidden]) items and the counter reads `n / <visible count>`; the active filter is respected." Bump `version` to `"0.3.0"`. Mirror a one-line note in `layouts/milpa-media-grid.contract.json`.

- [ ] **Step 3: Verify in the browser**

Open `http://localhost:4321/proof/gallery.html`. Filter to a tag (e.g. `harvest`, 4 items), open the lightbox, and confirm prev/next stays within those 4 and the counter reads `n / 4` (not `n / 12`). Reset the filter → prev/next cycles all 12 again. Keyboard (←/→, Esc) intact. Console zero errors.

- [ ] **Step 4: Commit**

```bash
git add proof/gallery.html layouts/milpa-lightbox.contract.json layouts/milpa-media-grid.contract.json
git -c commit.gpgsign=false commit -m "fix(gallery): el lightbox respeta el filtro activo (contador n/filtrados)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 9: Close-out — AA audit, version bump, docs, final gate

**Files:**
- Modify: `scripts/contrast-pairs.mjs` (only if the audit finds a genuinely new surface)
- Modify: `package.json` (version), `CHANGELOG.md`, `README.md`, `HANDOFF.md`, `DESIGN.md`

- [ ] **Step 1: AA-pairs audit**

Review every surface added: `mui-header` text = `--text` on translucent `--bg` → covered by `['text','bg',4.5]`; nav links `--text`/`--text-muted` on `bg` → covered; `mui-byline__name` = `--text` on `bg`/`surface` → covered by `['text','bg',4.5]`/`['text','surface',4.5]`; `mui-byline__meta` = `--text-muted` on `bg`/`surface` → covered by `['text-muted','bg',4.5]`/`['text-muted','surface',4.5]`; `mui-card__media` carries no text. **Expected result: no new pair.** Add a pair to `PAIRS` ONLY if the audit surfaces a genuinely new fg/bg role combination; otherwise leave `contrast-pairs.mjs` unchanged and note "audit: 0 new pairs — all reuse existing text/text-muted on bg/surface."

- [ ] **Step 2: Bump the version**

In `package.json`, change `"version": "0.2.0"` → `"version": "0.3.0"`.

- [ ] **Step 3: Write the CHANGELOG entry**

Prepend a `## [0.3.0] — 2026-07-03` section (update to the actual release date if it slips) under `## [Unreleased]` in `CHANGELOG.md`, titled «la plaza», with Added (mui-header, mui-card__media, mui-byline, media slots :is), Changed (gate: @layer brace-walk; lightbox respects filter; three-header taxonomy; proofs migrated), following the house voice.

- [ ] **Step 4: Update the docs**

- `README.md` — bump piece count (63 → 65) and add the three-header taxonomy line.
- `HANDOFF.md` — move A/B/E out of the T9 backlog (mark done), keep C/D; add the `v0.2.0` tag/release closure note if not present; note 0.3 pieces shipped.
- `DESIGN.md` — document the three-header taxonomy (mui-topbar / mui-docs__topbar / mui-header) and the overlay AA invariant.

- [ ] **Step 5: Final verification**

Run: `npm test`
Expected: PASS — contrast (193 + any new) + governance (brace-walk + 65 contracts + molde) + drift.

Run: `npm run verify:theme -- proof/themed-skin.css`
Expected: `ALL PASS` (the skin still honors the contract; if a new pair was added, confirm Nopal holds it).

Re-verify all migrated proofs in-browser one final time (landing/blog/saas/commerce/gallery) — dark/light/mobile/keyboard/console.

- [ ] **Step 6: Commit**

```bash
git add package.json CHANGELOG.md README.md HANDOFF.md DESIGN.md scripts/contrast-pairs.mjs
git -c commit.gpgsign=false commit -m "chore(release): @milpa/design 0.3.0 «la plaza» — versión, changelog, docs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Out of scope (deferred to later specs)

- Cluster **C**: `mui-input-group--stepper` (extractable qty stepper), `mui-tabs` pill/filter variant.
- Cluster **D**: pager standalone, `mui-stat --lg`, stack/cluster utility, drawer docked/inline, `mui-chart --line` with an HTML ticks row, footer mantra slot, media-gallery thumbs JS reference.
- `mui-hero__media` and `mui-cart-line__media` staying `img`-only (media-slot widening deferred for these two).
- Publishing to npm + creating the `v0.3.0` git tag/GitHub Release — **Rod's action** (npm OTP/2FA and the outward-facing tag push). Tag created unsigned (`-c tag.gpgSign=false`), release notes mirror the CHANGELOG, as with 0.2.0.

## Self-review notes (author)

- **Spec coverage:** A (Tasks 2-4) · B (Tasks 5-7) · E (Tasks 1, 8) · close-out (Task 9). All spec sections mapped.
- **Type/name consistency:** `firstUnlayeredRule` used identically in Task 1 test, module, and integration. `[data-nav-open]`/`[data-scrolled]`/`aria-expanded` consistent across header CSS (Task 2), contract (Task 2), and JS (Tasks 3-4). `.mui-header__*` slot names identical in CSS, contract, and proof markup.
- **No placeholders:** every CSS/JS/JSON step carries real content; the only "adjust per proof" is Task 4's brand/links, which is inherent to per-site content and bounded by the given template.
