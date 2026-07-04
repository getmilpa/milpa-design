# Milpa Design 0.4.0 «el trato» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the interaction cluster of `@milpa/design@0.4.0` — a `mui-input-group--stepper` (number ±) and a `mui-tabs--pill` variant with the documented single-panel filter pattern.

**Architecture:** Both are VARIANTS of existing pieces (no new pieces, no new bundle). `.mui-input-group--stepper` + `.mui-input-group__step` join `primitives/milpa-primitives.css` (`@layer milpa.primitives`, near the input-group cluster); `.mui-tabs--pill` joins `components/milpa-components.css` (`@layer milpa.components`, near the tabs cluster). Each variant is documented in its existing contract. Two proofs adopt them (commerce → stepper, gallery → pill filter).

**Tech Stack:** Pure CSS (custom properties, ARIA/native-attribute state), zero-dependency verification (`npm test`), inline demo JS in proofs only.

## Global Constraints

- CSS wrapped in its own `@layer` (stepper → `milpa.primitives`, pill → `milpa.components`); the governance brace-walk (`scripts/layer-guard.mjs`) fails `npm test` if any rule lands outside its layer.
- State via ARIA/native attributes, never `.is-*` classes: stepper uses native `min/max/step` + `[disabled]` on `.mui-input-group__step`; pill uses `[aria-selected="true"]`.
- Closed palette: NO new tokens. Pill selected = `--accent-subtle` bg + `--accent-text` (pair `['accent-text','accent-subtle',4.5]` already in the gate). Stepper reuses `--border-strong`/`--surface`/`--text-secondary`/`--text`/`--focus`/`--radius-base`/`--radius-sm`/`--dur-fast`/`--ease-standard`. No literal colors, ramp tokens, `!important`, raw z-index, or hardcoded durations (governance enforces).
- Zero published JS: behavior lives in each contract's `a11y.behavior`; demo JS lives only in proofs.
- Variants only → the contract count stays **65** (governance prints it; do not expect it to change). Contracts touched get `version` → `"0.4.0"`; house shape + required fields (`name, layer, version, class, summary, states, tokens, a11y`) intact.
- Quality floor: AA contrast, light/dark parity, reduced-motion parity, keyboard with `:focus-visible`, correct `aria-*`.
- Commits by explicit path (never `git commit -a`), unsigned (`git -c commit.gpgsign=false`) to match 0.2/0.3 and avoid the pinentry hang. Trailers on every commit: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s`.
- Verification: `npm test` green (193 AA + governance + 65 contracts + drift + layer-guard); `npm run verify:theme -- proof/themed-skin.css` ALL PASS; the two migrated proofs browser-verified dark/light/mobile/keyboard/console.

---

## Task 1: `mui-input-group--stepper` + commerce adopts it

**Files:**
- Modify: `primitives/milpa-primitives.css` (append the stepper CSS INSIDE `@layer milpa.primitives`, right after the input-group rules — the `.mui-input-group--suffix > .mui-input` rule)
- Modify: `primitives/milpa-input.contract.json` (add the `--stepper` variant + `__step` anatomy; `version` → `"0.4.0"`)
- Modify: `components/milpa-components.css` (the `.mui-cart-line__qty .mui-input { width: 3rem … }` rule becomes redundant — the stepper sizes the input; remove that width/text-align rule)
- Modify: `proof/commerce.html` (cart-line qty in the cart drawer AND the PDP `.shop-qty` adopt the stepper markup; add the reference stepper JS; drop the now-redundant `.shop-qty .mui-input { width: 3rem }` local rule)

**Interfaces:**
- Produces: `.mui-input-group--stepper` (a segmented `inline-flex` group), `.mui-input-group__step` (the −/+ buttons). Composes with `.mui-input-group--sm`.

- [ ] **Step 1: Add the stepper CSS**

In `primitives/milpa-primitives.css`, immediately after the `.mui-input-group--suffix > .mui-input { … }` rule (the last input-group rule, ~line 184) and INSIDE the `@layer milpa.primitives` wrapper, insert:

```css
/* stepper — número flanqueado por −/+ en un solo box segmentado. El grupo lleva
   el borde/radio/foco; el input adentro va borderless. Los botones se deshabilitan
   en los límites vía [disabled] (JS del consumidor); el teclado nativo ↑/↓ del
   number input ya funciona — los botones son afordancia redundante. */
.mui-input-group--stepper {
  display: inline-flex; align-items: stretch;
  background: var(--bg);
  border: 1px solid var(--border-strong); border-radius: var(--radius-base);
  overflow: hidden; /* recorta las esquinas de los botones al radio del grupo */
}
.mui-input-group--stepper:focus-within { border-color: var(--focus); }
.mui-input-group--stepper > .mui-input {
  border: 0; border-radius: 0; background: transparent;
  width: 3rem; text-align: center; padding-inline: 0;
}
.mui-input-group--stepper > .mui-input:focus-visible { outline: 0; } /* el grupo es el control */
.mui-input-group__step {
  flex: none; width: 2.5rem;
  display: inline-flex; align-items: center; justify-content: center;
  background: transparent; color: var(--text-secondary);
  border: 0; cursor: pointer;
  font-family: var(--font-display); font-size: var(--text-base); line-height: 1;
  -webkit-tap-highlight-color: transparent;
  transition:
    color            var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}
.mui-input-group__step:hover { color: var(--text); background: var(--surface); }
.mui-input-group__step:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.mui-input-group__step[disabled] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
/* tamaño sm (cart-line) — scopeado a --stepper para no tocar otros input-group --sm */
.mui-input-group--stepper.mui-input-group--sm { border-radius: var(--radius-sm); }
.mui-input-group--stepper.mui-input-group--sm > .mui-input { width: 2.5rem; }
.mui-input-group--stepper.mui-input-group--sm .mui-input-group__step { width: 2rem; }
```

- [ ] **Step 2: Add the `--stepper` variant to the input contract**

In `primitives/milpa-input.contract.json`: add to `anatomy` a `group__step` entry, add to `variants` a `stepper` entry, extend `a11y.behavior` (create it if the a11y object lacks it), and bump `version` to `"0.4.0"`. Exact additions:

- anatomy: `"group__step": ".mui-input-group__step — botón −/+ del stepper; [disabled] cuando el valor toca su límite (JS del consumidor)"`
- variants: `"stepper": ".mui-input-group--stepper — número flanqueado por botones −/+ en un box segmentado; el input va borderless, el grupo lleva el borde/foco. Compone con --sm."`
- a11y.behavior (add this string): `"stepper: el input es type=number con min/max/step; ↑/↓ nativos incrementan/decrementan. El consumidor cablea click en .mui-input-group__step −/+ → ajusta value respetando min/max/step, deshabilita ([disabled]) el botón del límite alcanzado, y emite input+change. Cada botón lleva aria-label (Decrease/Increase). Sin animación propia (reduced-motion no aplica)."`

- [ ] **Step 3: Remove the now-redundant cart-line qty width rule**

In `components/milpa-components.css`, delete the rule `.mui-cart-line__qty .mui-input { width: 3rem; text-align: center; }` (the stepper now sizes and centers the input). Leave `.mui-cart-line__qty { display: inline-flex; … }` as-is (it's the layout anchor).

- [ ] **Step 4: Migrate the two commerce qty controls + add the stepper JS**

In `proof/commerce.html`:
- The cart-line qty (`<div class="mui-input-group mui-cart-line__qty">…`) becomes a small stepper:
```html
<div class="mui-input-group mui-input-group--stepper mui-input-group--sm mui-cart-line__qty">
  <button type="button" class="mui-input-group__step" aria-label="Decrease quantity">−</button>
  <input class="mui-input mui-input--sm" type="number" value="1" min="1" max="99" step="1" aria-label="Quantity">
  <button type="button" class="mui-input-group__step" aria-label="Increase quantity">+</button>
</div>
```
- The PDP `.shop-qty` (`<div class="mui-input-group shop-qty">…`) becomes the full-size stepper (same structure, drop `mui-input-group--sm` and the `mui-input--sm`, keep `shop-qty` for any layout hook):
```html
<div class="mui-input-group mui-input-group--stepper shop-qty">
  <button type="button" class="mui-input-group__step" aria-label="Decrease quantity">−</button>
  <input class="mui-input" type="number" value="1" min="1" max="10" step="1" aria-label="Quantity">
  <button type="button" class="mui-input-group__step" aria-label="Increase quantity">+</button>
</div>
```
- Delete the local `.shop-qty .mui-input { width: 3rem; text-align: center; }` rule from the proof's `<style>` (the stepper sizes it now); keep `.shop-qty { display:inline-flex; align-items:center; gap:var(--space-1); }` only if still referenced, otherwise remove it too.
- Add the reference stepper JS to the proof's script (wire clamp + disable-at-bounds for every stepper on the page):
```js
/* ---------- stepper (mui-input-group--stepper): clamp + disable en límites ---------- */
document.querySelectorAll('.mui-input-group--stepper').forEach((grp) => {
  const input = grp.querySelector('.mui-input');
  const steps = grp.querySelectorAll('.mui-input-group__step');
  const dec = steps[0], inc = steps[1];
  const min = input.min !== '' ? Number(input.min) : -Infinity;
  const max = input.max !== '' ? Number(input.max) : Infinity;
  const step = Number(input.step) || 1;
  const sync = () => { const v = Number(input.value) || 0; dec.disabled = v <= min; inc.disabled = v >= max; };
  const bump = (dir) => {
    const v = Math.max(min, Math.min(max, (Number(input.value) || 0) + dir * step));
    input.value = String(v);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    sync();
  };
  dec.addEventListener('click', () => bump(-1));
  inc.addEventListener('click', () => bump(1));
  input.addEventListener('input', sync);
  sync();
});
```

- [ ] **Step 5: Verify the gate**

Run: `npm test`
Expected: PASS — every published file reports "toda regla vive dentro de @layer …"; contract count stays 65; the input contract stays valid (no ghost tokens; all stepper tokens exist). If governance flags a token, fix per the error.

- [ ] **Step 6: Browser-verify (controller does this; implementer notes what to check)**

Serve (`npm run proof`) and open `http://localhost:4321/proof/commerce.html`. Confirm: the cart-line and PDP qty render as segmented steppers; − and + change the value; − disables at min (1), + disables at max; the number input is centered and borderless inside the group's border; `:focus-within` marks the group border; keyboard ↑/↓ on the input works; dark/light both legible; console clean.

- [ ] **Step 7: Commit**

```bash
git add primitives/milpa-primitives.css primitives/milpa-input.contract.json components/milpa-components.css proof/commerce.html
git -c commit.gpgsign=false commit -m "feat(primitives): mui-input-group--stepper — número ± segmentado; commerce lo adopta

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 2: `mui-tabs--pill` + filter pattern + gallery adopts it

**Files:**
- Modify: `components/milpa-components.css` (append the `.mui-tabs--pill` rules INSIDE `@layer milpa.components`, right after the tabs cluster — after the `.mui-tabs__panel:focus-visible` rule ~line 565)
- Modify: `components/milpa-tabs.contract.json` (add the `--pill` variant + the single-panel filter pattern to `a11y.behavior`; `version` → `"0.4.0"`)
- Modify: `proof/gallery.html` (the filter tablist adopts `--pill`)

**Interfaces:**
- Consumes: the base `.mui-tabs` / `.mui-tabs__tab` from components. Produces: `.mui-tabs--pill` (visual variant).

- [ ] **Step 1: Add the pill CSS**

In `components/milpa-components.css`, immediately after the `.mui-tabs__panel:focus-visible { … }` rule (~line 565) and INSIDE `@layer milpa.components`, insert:

```css
/* variante pill — sin línea base; el fill de la seleccionada ES el indicador (no el
   subrayado). Sirve para tabs de contenido o para filtros (patrón de panel único: ver
   a11y.behavior del contrato). */
.mui-tabs--pill { border-bottom: 0; }
.mui-tabs--pill .mui-tabs__tab {
  border-bottom: 0; margin-bottom: 0;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
}
.mui-tabs--pill .mui-tabs__tab:hover { background: var(--surface); color: var(--text); }
.mui-tabs--pill .mui-tabs__tab[aria-selected="true"] {
  background: var(--accent-subtle); color: var(--accent-text);
  border-bottom-color: transparent;
}
.mui-tabs--pill .mui-tabs__tab:focus-visible { outline-offset: 2px; }
```

- [ ] **Step 2: Update the tabs contract**

In `components/milpa-tabs.contract.json`: add to `variants` a `pill` entry, add the filter pattern to `a11y.behavior`, bump `version` to `"0.4.0"`. Exact additions:

- variants: `"pill": ".mui-tabs--pill — pestañas con forma de pill en vez del subrayado; seleccionada = fondo accent-subtle + texto accent-text (el fill es el indicador). Aplica a tabs de contenido o a filtros."`
- a11y.behavior (add this string): `"patrón de filtro (panel único): todas las role=tab de un role=tablist apuntan a UNA región role=tabpanel vía aria-controls; seleccionar una tab FILTRA los ítems de esa región vía [hidden] (no cambia de panel); el contador/región se actualiza. Teclado: roving tabindex (solo la activa tabbable), ←/→ mueven selección, Home/End al extremo; el JS del consumidor sincroniza aria-selected + el filtro. Caveat: role=tab implica cambiar de panel — para un filtro (elegir uno de N que filtra en su lugar) es un estiramiento aceptado del patrón, elegido por familiaridad sobre un toolbar de aria-pressed."`

- [ ] **Step 3: Gallery filter tabs adopt `--pill`**

In `proof/gallery.html`, the filter tablist (~line 111) `<div class="mui-tabs" role="tablist" aria-label="Filter pieces by season stage">` → `<div class="mui-tabs mui-tabs--pill" role="tablist" aria-label="Filter pieces by season stage">`. Nothing else changes — the filter JS keys off `.mui-tabs__tab[data-filter]` and is unaffected.

- [ ] **Step 4: Verify the gate**

Run: `npm test`
Expected: PASS — the pill rules live inside `@layer milpa.components`; contract count stays 65; tabs contract valid; the selected-pill pair `accent-text`/`accent-subtle` is already gated so no new pair is needed.

- [ ] **Step 5: Browser-verify (controller; implementer notes what to check)**

Open `http://localhost:4321/proof/gallery.html`. Confirm: the filter tabs render as pills (no baseline underline); the selected pill has the `accent-subtle` fill + `accent-text` text; clicking a filter still filters the grid and moves the selected pill; ←/→ + Home/End move selection (roving tabindex); the `:focus-visible` ring shows with positive offset; the count badges still sit inside each pill; dark/light both legible (selected pill AA); console clean.

- [ ] **Step 6: Commit**

```bash
git add components/milpa-components.css components/milpa-tabs.contract.json proof/gallery.html
git -c commit.gpgsign=false commit -m "feat(components): mui-tabs--pill + patrón de filtro de panel único; gallery lo adopta

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 3: Close-out — AA audit, version, CHANGELOG, docs, final gate

**Files:**
- Modify: `scripts/contrast-pairs.mjs` (ONLY if the audit finds a new pair — expected none)
- Modify: `package.json` (version), `CHANGELOG.md`, `README.md`, `HANDOFF.md`

- [ ] **Step 1: AA-pairs audit**

Review the new surfaces: the stepper's − /+ buttons use `--text-secondary`→`--text` on `--bg`/`--surface` (covered by existing `['text','bg']`/`['text','surface']`/`['text-secondary','bg']`); the number input text = `--text` on `--bg` (covered); the pill's selected state = `--accent-text` on `--accent-subtle` (covered by `['accent-text','accent-subtle',4.5]`, already in `PAIRS`), unselected pill text = `--text-secondary`/`--text` on `--bg`/`--surface` (covered). **Expected: 0 new pairs.** Add to `PAIRS` ONLY if a genuinely new fg/bg role combination appears; otherwise leave `contrast-pairs.mjs` unchanged and note "audit: 0 new pairs."

- [ ] **Step 2: Version bump**

In `package.json`, `"version": "0.3.0"` → `"version": "0.4.0"`.

- [ ] **Step 3: CHANGELOG**

Prepend a `## [0.4.0] — 2026-07-04` section (titled «el trato») under `## [Unreleased]` in `CHANGELOG.md`, house voice (match prior entries), covering:
- **Added:** `mui-input-group--stepper` (número ± segmentado; el input va borderless, el grupo lleva el borde; botones `[disabled]` en los límites; cart-line y el PDP de commerce lo adoptan). `mui-tabs--pill` (variante visual pill; seleccionada = `accent-subtle`/`accent-text`).
- **Changed:** el contrato de `mui-tabs` documenta el **patrón de filtro de panel único** (todas las tabs → una región, filtro vía `[hidden]`, roving tabindex; el gallery lo estrena como pills). Variantes, no piezas nuevas → contratos siguen en 65.

- [ ] **Step 4: Docs**

- `README.md`: si menciona conteos, siguen 65 (variantes, no piezas). Añadí una línea mencionando el stepper y la variante pill de tabs si el README lista piezas destacadas; si no, dejalo.
- `HANDOFF.md`: en el backlog §4 T9, marcá el **cluster C** como hecho (los dos items: qty stepper y tabs pill/filtro); mantené **D** y los hallazgos **F** (#8/#9/#10) + los 2 Minors diferidos abiertos.

- [ ] **Step 5: Final verification**

Run: `npm test` → PASS (193 AA + governance brace-walk + 65 contracts + drift + layer-guard).
Run: `npm run verify:theme -- proof/themed-skin.css` → `ALL PASS` (si se añadió un par, confirmá que Nopal lo honra).
Re-glance commerce (stepper) and gallery (pill filter) in-browser once more (dark/light, keyboard).

- [ ] **Step 6: Commit**

```bash
git add package.json CHANGELOG.md README.md HANDOFF.md
git -c commit.gpgsign=false commit -m "chore(release): @milpa/design 0.4.0 «el trato» — versión, changelog, docs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Out of scope (deferred to later specs)

- Cluster **D**: pager standalone, `mui-stat --lg`, stack/cluster utility, drawer docked/inline, `mui-chart --line` with HTML ticks, footer mantra slot, media-gallery thumbs JS.
- Findings **F**: off-canvas → `<dialog>` (header + docs shell), `mui-header` mobile-actions pattern, media `:is()` `<picture>` descendant-combinator, the `card__media`/lightbox guard Minors.
- Publishing to npm + creating the `v0.4.0` git tag/GitHub Release — **Rod's action** (npm OTP/2FA and the outward-facing tag push). Tag created unsigned (`-c tag.gpgSign=false`), release notes mirror the CHANGELOG, as with 0.2/0.3.

## Self-review notes (author)

- **Spec coverage:** C1 (Task 1) · C2 (Task 2) · close-out (Task 3). All spec sections mapped.
- **Type/name consistency:** `.mui-input-group--stepper` / `.mui-input-group__step` identical across CSS (Task 1 Step 1), contract (Step 2), and commerce markup (Step 4). `.mui-tabs--pill` identical across CSS (Task 2 Step 1), contract (Step 2), and gallery markup (Step 3). The stepper JS selects `.mui-input-group__step` (two per group) and `.mui-input` — matching the markup.
- **No placeholders:** every CSS/JSON/JS step carries real content; token existence pre-verified (`--radius-full`, `--accent-subtle`, `--accent-text`, `--border-strong`, etc. all in `dist/milpa-tokens.css`; the pill AA pair already in `PAIRS`).
