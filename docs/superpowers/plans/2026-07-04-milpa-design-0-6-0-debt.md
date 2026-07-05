# Milpa Design 0.6.0 «el deshierbe» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pay down the T9 technical debt: rework the header/docs off-canvas menu to a `<dialog>` (`mui-drawer`) so it no longer needs `overflow-x:clip` (F#8, resolves F#9), fix the media-slot descendant combinator (F#10), and clear 5 Minors.

**Architecture:** The mobile off-canvas menu becomes a `<dialog class="mui-drawer">` opened via `showModal()` (top layer → doesn't extend document scroll → the `overflow-x:clip` consumer requirement disappears). `mui-header` and `mui-docs` drop their `position:fixed` panel + scrim + `[data-nav-open]` CSS; a new `mui-drawer--start` (left-anchored) variant serves the docs sidebar. Media slots switch descendant `:is()` to child `> :is()`. Nothing published gains JS; the dialog wiring is demo JS in the proofs.

**Tech Stack:** Pure CSS (`@layer`, native `<dialog>` top layer + `::backdrop`), ARIA/native-attribute state, zero-dependency `npm test`, inline demo JS in proofs only.

## Global Constraints

- CSS wrapped in its own `@layer` (the governance brace-walk fails `npm test` if any rule lands outside). State via ARIA/native attributes, never `.is-*`.
- Closed palette: NO new tokens (all reuse existing: `--border`, `--surface`, `--shadow-lg`, `--radius-none`, `--dur-moderate`/`--ease-grano`, `--space-*`, `--focus`, `--z-drawer`, etc.). No literal colors, ramps, `!important`, raw z-index, hardcoded durations (governance enforces).
- Zero published JS: the dialog `showModal`/close wiring lives ONLY in the proofs; the behavior is documented in the contracts' `a11y.behavior`.
- The off-canvas mechanism of `mui-header`/`mui-docs` changes (`[data-nav-open]` → `<dialog>`/`showModal`) — a behavior change to shipped pieces → **minor 0.6.0 with a compat note in the CHANGELOG**. Contracts touched get `version` "0.6.0". Contract COUNT stays **68** (docs/variants, no new pieces).
- Quality floor: AA contrast, light/dark parity, reduced-motion parity, keyboard `:focus-visible`, correct `aria-*`. `<html>` always carries `data-theme`.
- Commits by explicit path (never `git commit -a`), unsigned (`git -c commit.gpgsign=false`). Trailers on every commit: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s`.
- Verification: `npm test` green (193 AA + governance + 68 contracts + drift + layer-guard); `verify:theme` ALL PASS; **the release's point** — all proofs at 390px have `document.scrollWidth - clientWidth === 0` with NO `overflow-x:clip`, and the mobile menu opens as a `<dialog>` (Esc/backdrop/focus-trap), toggle syncs `aria-expanded`.

---

## Task 1: `mui-drawer--start` variant + drawer contract

**Files:**
- Modify: `components/milpa-components.css` (add `mui-drawer--start` + its keyframe INSIDE `@layer milpa.components`, right after the drawer cluster)
- Modify: `components/milpa-drawer.contract.json` (`--start` variant + the docked `a11y.aria` line; `version` "0.6.0")

**Interfaces:**
- Produces: `.mui-drawer--start` (left/`inline-start`-anchored drawer that slides in from the left).

- [ ] **Step 1: Add the `--start` variant**

The base `.mui-drawer` anchors to `inline-end` (right) with `@keyframes mui-drawer-in { from { translateX(100%) } }`. Add a left-anchored variant right after the drawer's `:focus-visible` rule, INSIDE `@layer milpa.components`:

```css
/* --start: drawer anclado al inline-start (izquierda) — para navs cuyo toggle
   vive a la izquierda (ej. el shell docs). Espeja el ancla, el borde y el slide. */
@keyframes mui-drawer-in-start {
  from { opacity: 0; transform: translateX(-100%); }
  to   { opacity: 1; transform: none; }
}
.mui-drawer--start {
  inset-inline-end: auto; inset-inline-start: 0;
  margin-inline-start: 0; margin-inline-end: auto;
  border-inline-start: 0; border-inline-end: 1px solid var(--border);
}
.mui-drawer--start[open] { animation-name: mui-drawer-in-start; }
```

- [ ] **Step 2: Update the drawer contract**

In `components/milpa-drawer.contract.json`: add `"start"` to `variants` ("anclado al inline-start (izquierda) — espeja ancla/borde/slide; para navs con toggle a la izquierda"); add to the `a11y.aria` array a line for the docked pattern: "docked (`--docked`): `<aside aria-label=\"…\">` — sin `aria-labelledby` de dialog ni botón de cierre (es una region, no un dialog)". Bump `version` to `"0.6.0"`.

- [ ] **Step 3: Verify**

Run: `npm test` → PASS (rule inside `@layer milpa.components`; drawer contract valid; contract count stays 68; no ghost tokens — `--border` exists).

- [ ] **Step 4: Commit**

```bash
git add components/milpa-components.css components/milpa-drawer.contract.json
git -c commit.gpgsign=false commit -m "feat(components): mui-drawer--start (drawer izquierdo) + aria del docked

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 2: F#8 header — off-canvas → `<dialog>`, migrate the 5 marketing proofs

**Files:**
- Modify: `layouts/milpa-layouts.css` (remove the `mui-header` mobile off-canvas CSS; keep the toggle-shown + hide-inline-nav rules)
- Modify: `layouts/milpa-header.contract.json` (document the `<dialog>` mobile-menu pattern; `version` "0.6.0")
- Modify: `landing/index.html`, `proof/blog.html`, `proof/saas.html`, `proof/gallery.html`, `proof/commerce.html` (migrate the mobile nav to a `<dialog class="mui-drawer">` opened via `showModal`; remove `html,body{overflow-x:clip}` from the 4 proofs that have it; commerce's search moves into the drawer)

**Interfaces:**
- Consumes: `.mui-drawer` (existing). Produces: the reference `<dialog>` mobile-menu markup + JS reused across proofs.

- [ ] **Step 1: Strip the header off-canvas CSS**

In `layouts/milpa-layouts.css`: DELETE the base `.mui-header__scrim { display: none; }` rule. In the `mui-header` `@media (max-width: 880px)` block, DELETE the `.mui-header__nav` fixed-panel rule, the `.mui-header[data-nav-open] .mui-header__nav` rule, and the `.mui-header[data-nav-open] .mui-header__scrim` rule. Replace the block body so only the toggle-shown + inline-nav-hidden remain:

```css
@media (max-width: 880px) {
  .mui-header__toggle { display: inline-flex; margin-inline-start: auto; }
  /* el menú móvil es un <dialog class="mui-drawer"> aparte (top layer, sin
     overflow-x:clip); el nav inline se oculta ≤880px. */
  .mui-header__nav { display: none; }
}
```

- [ ] **Step 2: Update the header contract**

In `layouts/milpa-header.contract.json`: rewrite the `a11y.behavior` off-canvas line(s). Remove the old `[data-nav-open]`/scrim/`overflow-x:clip` prose. Add: "≤880px el `.mui-header__nav` inline se oculta y el `.mui-header__toggle` abre (`showModal()`) un `<dialog class=\"mui-drawer\">` con los links duplicados + las acciones de barra que no caben (ej. search); el drawer da top layer/focus-trap/Esc/`::backdrop`, así que NO hace falta `overflow-x:clip` en la raíz. El toggle sincroniza `aria-expanded` con el open/close del dialog." Remove the old `overflow-x:clip` invariant if present. Also drop `scrim` from `anatomy` (no longer used). Bump `version` to `"0.6.0"`.

- [ ] **Step 3: Migrate `landing/index.html` (the reference)**

The landing header keeps its inline nav + actions. Add a mobile-menu `<dialog>` after the header, and swap the off-canvas JS for `showModal`. Reference markup (place right after `</header>`):

```html
<dialog class="mui-drawer" id="mobileMenu" aria-labelledby="mobileMenu-title">
  <header class="mui-drawer__header">
    <h2 class="mui-drawer__title" id="mobileMenu-title">Menu</h2>
    <button class="mui-btn mui-btn--ghost mui-btn--icon" id="menuClose" type="button" aria-label="Close menu">✕</button>
  </header>
  <div class="mui-drawer__body">
    <nav class="mui-stack" aria-label="Menu">
      <a class="mui-btn mui-btn--ghost" href="/docs">Docs</a>
      <a class="mui-btn mui-btn--ghost" href="https://github.com/getmilpa/milpa-design">GitHub</a>
      <a class="mui-btn mui-btn--ghost" href="https://www.npmjs.com/package/@milpa/design">npm</a>
    </nav>
  </div>
</dialog>
```
Point the toggle at it: `<button … id="navToggle" … aria-expanded="false" aria-controls="mobileMenu">`. Remove the old `.mui-header__scrim` element and the `id="navScrim"` from the markup. Replace the header JS (the `[data-nav-open]` toggle + scrim/Esc/inert block) with:

```js
/* ---------- mobile menu: <dialog class="mui-drawer"> (top layer, no overflow) ---------- */
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
navToggle.addEventListener('click', () => { mobileMenu.showModal(); navToggle.setAttribute('aria-expanded', 'true'); });
mobileMenu.addEventListener('close', () => navToggle.setAttribute('aria-expanded', 'false'));
mobileMenu.querySelector('#menuClose').addEventListener('click', () => mobileMenu.close());
mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) mobileMenu.close(); }); // backdrop light-dismiss
```
Keep the `[data-scrolled]` overlay scroll listener and the theme/copy/GSAP blocks untouched (the `--overlay` variant is orthogonal). The landing has no `overflow-x:clip` to remove (it relied on GSAP; the dialog now handles it cleanly).

- [ ] **Step 4: Migrate blog/saas/gallery/commerce**

Apply the SAME pattern (Step 3) to `proof/blog.html`, `proof/saas.html`, `proof/gallery.html`, `proof/commerce.html`: add a `<dialog class="mui-drawer" id="mobileMenu">` with that proof's links duplicated (`mui-drawer__header` with a close button + `mui-drawer__body` with a `mui-stack` nav), point the toggle at it, and swap the off-canvas JS for the `showModal` block. **Remove `html,body{overflow-x:clip}` from each of these four proofs' local `<style>`** (no longer needed). Remove each proof's `.mui-header__scrim`/`navScrim` element.
- **Commerce (F#9):** put the store search INSIDE the mobile menu drawer (the search input that was hidden ≤880px in 0.4 now lives in the drawer body, above/below the nav links) and REMOVE the commerce `@media (max-width:880px){ .mui-header__actions .mui-input-group { display:none } }` search-hide rule + the brand-badge-hide rule (search is no longer lost on mobile — it's in the drawer).

- [ ] **Step 5: Verify + browser (controller)**

Run: `npm test` → PASS (header off-canvas rules gone, no orphaned selectors; header contract valid; contract count 68). The controller opens each of the 5 proofs at 390px and confirms: `document.scrollWidth - clientWidth === 0` (zero horizontal overflow, WITHOUT `overflow-x:clip`); the hamburger opens the `<dialog>` menu (top layer over the page), Esc + backdrop-click + the close button all close it, focus is trapped while open and returns to the toggle on close, `aria-expanded` flips; commerce's search is present and usable inside the drawer. Dark/light, console clean.

- [ ] **Step 6: Commit**

```bash
git add layouts/milpa-layouts.css layouts/milpa-header.contract.json landing/index.html proof/blog.html proof/saas.html proof/gallery.html proof/commerce.html
git -c commit.gpgsign=false commit -m "feat(header): off-canvas móvil → <dialog class=mui-drawer> (sin overflow-x:clip); search de commerce al drawer (F#8/F#9)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 3: F#8 docs — off-canvas → `<dialog class="mui-drawer mui-drawer--start">`

**Files:**
- Modify: `layouts/milpa-layouts.css` (remove the `mui-docs` mobile off-canvas CSS)
- Modify: `layouts/milpa-docs.contract.json` (document the dialog mobile-menu pattern; `version` "0.6.0")
- Modify: `proof/docs.html` (migrate the mobile nav to a left-anchored `<dialog>`)

**Interfaces:**
- Consumes: `.mui-drawer--start` (Task 1). 

- [ ] **Step 1: Strip the docs off-canvas CSS**

In `layouts/milpa-layouts.css`: DELETE the base `.mui-docs__scrim { display: none; }` rule. In the `mui-docs` `@media (max-width: 880px)` block, DELETE the `.mui-docs__nav` fixed-panel rule, the `.mui-docs[data-nav-open] .mui-docs__nav` rule, and the `.mui-docs[data-nav-open] .mui-docs__scrim` rule. The block becomes:

```css
@media (max-width: 880px) {
  .mui-docs { grid-template-columns: 1fr; }
  /* el menú móvil es un <dialog class="mui-drawer mui-drawer--start"> aparte;
     la sidebar inline se oculta ≤880px. */
  .mui-docs__nav { display: none; }
  .mui-docs__topbar-nav { display: none; }
  .mui-docs__nav-toggle { display: inline-flex; }
}
```

- [ ] **Step 2: Update the docs contract**

In `layouts/milpa-docs.contract.json`: rewrite the off-canvas `a11y.behavior` prose the same way as the header (Task 2 Step 2) but for the docs sidebar: ≤880px the inline `.mui-docs__nav` hides and the `.mui-docs__nav-toggle` opens (`showModal()`) a `<dialog class="mui-drawer mui-drawer--start">` (left-anchored, matching the left toggle) with the nav tree duplicated; top layer → no `overflow-x:clip`; `aria-expanded` synced. Drop the `scrim` from `anatomy`. Bump `version` to `"0.6.0"`.

- [ ] **Step 3: Migrate `proof/docs.html`**

Add a left-anchored mobile-menu dialog after the docs topbar (duplicating the nav tree), point the `nav-toggle` at it, and add the `showModal` JS (same shape as the header reference, Task 2 Step 3, but `class="mui-drawer mui-drawer--start"` and the drawer body holds the duplicated `.mui-docs__nav` groups/items). Remove the old `.mui-docs__scrim`/`data-nav-open` toggle JS and the scrim element. docs.html has no `overflow-x:clip` to remove (it never had it — that was the F#8 bug; the dialog fixes it).

- [ ] **Step 4: Verify + browser (controller)**

Run: `npm test` → PASS (docs off-canvas rules gone; docs contract valid; contract count 68). Controller opens `proof/docs.html` at 390px: `document.scrollWidth - clientWidth === 0` (the F#8 bug — ~208px overflow — is GONE, with NO `overflow-x:clip`); the nav-toggle opens the left-anchored `<dialog>` (slides from the left), Esc/backdrop/close work, focus trapped; dark/light, console clean.

- [ ] **Step 5: Commit**

```bash
git add layouts/milpa-layouts.css layouts/milpa-docs.contract.json proof/docs.html
git -c commit.gpgsign=false commit -m "feat(docs): off-canvas del shell → <dialog class=mui-drawer--start> (arregla el overflow de docs.html, F#8)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 4: F#10 — media slots descendant → child combinator

**Files:**
- Modify: `layouts/milpa-layouts.css` (media-grid + lightbox media selectors)
- Modify: `components/milpa-components.css` (product-card + media-gallery media selectors)
- Modify: the media-slot contracts (`milpa-media-grid`, `milpa-lightbox`, `milpa-product-card`, `milpa-media-gallery`): note that a `<picture>` slots as the DIRECT child; `version` "0.6.0"

- [ ] **Step 1: Verify direct-child markup, then widen the combinator**

FIRST confirm in the proofs (gallery/commerce) that each slot's media is a DIRECT child of the slot (e.g. `.mui-media-grid__item > svg`, `.mui-media-gallery__main > svg`). For each slot where it is, change the descendant `:is(img, svg, picture)` to child `> :is(img, svg, picture)` (matching `.mui-card__media > :is(...)` at `components/milpa-components.css:217`):

`layouts/milpa-layouts.css`:
- `.mui-media-grid__item :is(img, svg, picture)` → `.mui-media-grid__item > :is(img, svg, picture)`
- `.mui-media-grid__item:hover :is(img, svg, picture)` → `.mui-media-grid__item:hover > :is(img, svg, picture)` (this is the hover-scale — the whole point of F#10)
- `.mui-media-grid--masonry .mui-media-grid__item :is(img, svg, picture)` → `… .mui-media-grid__item > :is(img, svg, picture)`
- `.mui-lightbox__media :is(img, svg, picture)` → `.mui-lightbox__media > :is(img, svg, picture)`

`components/milpa-components.css`:
- `.mui-product-card__media :is(img, svg, picture)` → `.mui-product-card__media > :is(img, svg, picture)`
- `.mui-product-card[aria-disabled="true"] .mui-product-card__media :is(img, svg, picture)` → `… .mui-product-card__media > :is(img, svg, picture)`
- `.mui-media-gallery__main :is(img, svg, picture)` → `.mui-media-gallery__main > :is(img, svg, picture)`
- `.mui-media-gallery__thumb :is(img, svg, picture)` → `.mui-media-gallery__thumb > :is(img, svg, picture)`

If any slot nests its media (not a direct child), LEAVE that one as descendant and note it in the report + contract (do not silently break it).

- [ ] **Step 2: Update the 4 media-slot contracts**

In `milpa-media-grid`, `milpa-lightbox`, `milpa-product-card`, `milpa-media-gallery` contracts: add to the media-slot anatomy/a11y note that the media (`:is(img, svg, picture)`) is the slot's DIRECT child — a `<picture>` slots as the direct child so its inner `<img>` isn't double-matched (the child combinator prevents a compounded hover-scale). Bump each `version` to `"0.6.0"`.

- [ ] **Step 3: Verify + browser (controller)**

Run: `npm test` → PASS (selectors valid, inside their layers; contract count 68). Controller: in a proof, temporarily place a `<picture><img></picture>` in a media-grid item and confirm hover applies `scale(1.03)` ONCE (not ≈1.061 compounded) — or, since no proof ships `<picture>`, confirm the existing `<svg>`/`<img>` media still render/hover correctly (the child combinator matches direct-child media identically for the current markup). Zero visual regression.

- [ ] **Step 4: Commit**

```bash
git add layouts/milpa-layouts.css components/milpa-components.css layouts/milpa-media-grid.contract.json layouts/milpa-lightbox.contract.json components/milpa-product-card.contract.json components/milpa-media-gallery.contract.json
git -c commit.gpgsign=false commit -m "fix(media): combinador hijo en los media slots — un <picture> matchea una vez (F#10)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 5: Minors — gallery guard, stack/cluster anatomy, SOC 2 badge, `[hidden]`-policy doc

**Files:**
- Modify: `proof/gallery.html` (empty-set guard in the lightbox `show(i)`)
- Modify: `layouts/milpa-stack.contract.json`, `layouts/milpa-cluster.contract.json` (add `anatomy`; `version` "0.6.0")
- Modify: `proof/saas.html` + `layouts/milpa-stack.contract.json` + `layouts/milpa-cluster.contract.json` examples (standardize the SOC 2 badge variant)
- Modify: `DESIGN.md` (document the inner-media `[hidden]`-guard policy)

- [ ] **Step 1: Gallery empty-set guard**

In `proof/gallery.html`, the lightbox `show(i)` (or `show` function) opens with `const items = visibleItems();`. Add immediately after it: `if (!items.length) return;` — so an empty visible set (a future filter matching nothing) can't produce `(i + 0) % 0 = NaN` → `items[NaN]` undefined → TypeError.

- [ ] **Step 2: stack/cluster `anatomy`**

In `layouts/milpa-stack.contract.json`, add an `anatomy` object: `{ "root": ".mui-stack — columna flex con gap por variante de tamaño" }`. In `layouts/milpa-cluster.contract.json`: `{ "root": ".mui-cluster — fila flex que envuelve, centrada, con gap por variante de tamaño" }`. Bump both `version` to `"0.6.0"`.

- [ ] **Step 3: Standardize the SOC 2 badge**

"SOC 2 Type II" renders as `mui-badge--secondary` in the saas hero and `mui-badge--accent` in the Trust/Preview sections; the `milpa-stack`/`milpa-cluster` contract examples also disagree. Pick **`mui-badge--accent`** (the more-used one) and make every "SOC 2 Type II" badge use it: in `proof/saas.html` change the hero instance from `--secondary` to `--accent`; in the `milpa-stack` contract example (currently `--secondary`) change it to `--accent`. (Leave other badges alone — only "SOC 2 Type II" is being unified.)

- [ ] **Step 4: Document the `[hidden]`-guard policy**

In `DESIGN.md`, near the quality-floor / guard rule (the "composed pieces guard `[hidden]`" convention), add a clarifying sentence: the `[hidden]` guard applies to the **toggle-target/container** a filter hides (e.g. `.mui-media-grid__item[hidden]`), NOT to **inner-media** rules (`mui-card__media`, the media slots' `:is(img,svg,picture)`), which are not hide/show targets — so inner-media `display` rules intentionally carry no `[hidden]` guard. (This resolves the 0.3 review's open policy question; no code change.)

- [ ] **Step 5: Verify**

Run: `npm test` → PASS (the two contracts valid with the new `anatomy`; contract count 68). Static: `node --check` the gallery JS. (No browser needed — the guard is unreachable today, the anatomy/badge/DESIGN are docs/cosmetic; the controller may glance the saas SOC 2 badges are uniform.)

- [ ] **Step 6: Commit**

```bash
git add proof/gallery.html layouts/milpa-stack.contract.json layouts/milpa-cluster.contract.json proof/saas.html DESIGN.md
git -c commit.gpgsign=false commit -m "chore(0.6): guard de set vacío del gallery, anatomy de stack/cluster, badge SOC2 uniforme, política del guard [hidden] en DESIGN

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 6: Close-out — AA audit, version, CHANGELOG (compat note), docs, final gate

**Files:**
- Modify: `scripts/contrast-pairs.mjs` (ONLY if the audit finds a new pair — expected none)
- Modify: `package.json` (version), `CHANGELOG.md`, `README.md`, `HANDOFF.md`

- [ ] **Step 1: AA audit** — the rework reuses gated surfaces (the drawer's `--text`/`--surface`, the mobile menu links = `mui-btn` already gated; media-slot changes are combinator-only, no color). **Expected: 0 new pairs.** Leave `contrast-pairs.mjs` unchanged unless a genuinely new fg/bg combo appears; note "audit: 0 new pairs."

- [ ] **Step 2: Version bump** — `package.json` `"0.5.0"` → `"0.6.0"`.

- [ ] **Step 3: CHANGELOG** — prepend `## [0.6.0] — 2026-07-04` (titled «el deshierbe») under `## [Unreleased]`, house voice. Cover:
  - **Changed (con nota de compat destacada):** el off-canvas móvil de `mui-header` y `mui-docs` pasó de un panel `position:fixed` + `[data-nav-open]` a un **`<dialog class="mui-drawer">`** abierto con `showModal()` (top layer). Consecuencias: (1) **ya NO hace falta `overflow-x:clip`** en la raíz de la página — se removió de los proofs; (2) el menú móvil es un elemento aparte con los links duplicados; (3) COMPAT: quien usaba el off-canvas viejo migra el toggle a `showModal()` sobre un `mui-drawer` y borra el scrim/`[data-nav-open]`. Arregla el overflow de `docs.html` (F#8) y devuelve el buscador de commerce en móvil dentro del drawer (F#9).
  - **Fixed:** los media slots usan combinador **hijo** (`> :is(img, svg, picture)`) — un `<picture>` ya no dispara el hover-scale doble (F#10). Guard de set vacío en el lightbox del gallery.
  - **Added:** `mui-drawer--start` (drawer anclado a la izquierda, para el shell docs).
  - Contratos siguen **68**. Backlog T9: **cerrado** (F#8/#9/#10 + Minors hechos).

- [ ] **Step 4: Docs** — `README.md`: sin cambio de conteo (68). `HANDOFF.md` §4: marcá los hallazgos **F #8/#9/#10** y los Minors hechos; el backlog T9 queda **cerrado** (dejá solo lo genuinamente futuro: Storybook T5, multiplataforma).

- [ ] **Step 5: Final verification** — `npm test` → PASS (193 AA + governance + 68 contratos + drift + layer-guard). `npm run verify:theme -- proof/themed-skin.css` → ALL PASS. Re-glance all 6 proofs at 390px one last time (0 overflow, dialog menu works).

- [ ] **Step 6: Commit**

```bash
git add package.json CHANGELOG.md README.md HANDOFF.md
git -c commit.gpgsign=false commit -m "chore(release): @milpa/design 0.6.0 «el deshierbe» — versión, changelog (compat), docs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Out of scope (deferred / future)

- Storybook (T5) — the proofs cover the pieces.
- Multi-platform token outputs (iOS/Android/Figma) — revisit if needed.
- Publishing to npm + `v0.6.0` git tag/GitHub Release — **Rod's action** (npm OTP/2FA + outward-facing tag). Tag unsigned (`-c tag.gpgSign=false`), notes mirror the CHANGELOG.

## Self-review notes (author)

- **Spec coverage:** F#8 header (Task 2) + docs (Task 3) + drawer--start (Task 1); F#9 (commerce search → drawer, Task 2 Step 4); F#10 (Task 4); Minors — drawer aria (Task 1), gallery guard + stack/cluster anatomy + SOC2 + `[hidden]` policy (Task 5); close-out (Task 6). All spec sections mapped.
- **Type/name consistency:** `.mui-drawer--start`, `#mobileMenu`/`#navToggle`/`#menuClose`, `.mui-drawer__header`/`__title`/`__body` consistent across Task 1 CSS, Task 2/3 proof markup + JS. The off-canvas removal (Task 2/3) and the dialog wiring reference the same `mui-drawer` structure.
- **No placeholders:** every CSS/JS/markup step carries real content; the CSS-removal steps name the exact rules to delete (verified against the current `@media ≤880px` blocks); tokens pre-verified. The one conditional (Task 4 Step 1 "if a slot nests media, keep descendant") is a real safeguard the implementer resolves per-slot against the markup, not a deferral.
