# Milpa Design 0.5.0 «la mano» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship cluster D of `@milpa/design@0.5.0` — seven polish pieces: `mui-pager` (standalone), `mui-stack`/`mui-cluster` (layout utilities), `mui-stat --lg`, `mui-drawer --docked`, `mui-chart --line` + HTML ticks, the footer mantra slot, and the media-gallery thumbs reference JS.

**Architecture:** Extend the existing bundles (no new bundle). `mui-pager`/`mui-stack`/`mui-cluster` join `layouts/milpa-layouts.css` (`@layer milpa.layouts`) as new pieces with their own contracts; the rest are variants/behaviors documented in existing contracts. Three new contracts (`mui-pager`, `mui-stack`, `mui-cluster`) → contract count 65 → 68.

**Tech Stack:** Pure CSS (custom properties, ARIA/native-attribute state), zero-dependency verification (`npm test`), inline demo JS in proofs only.

## Global Constraints

- CSS wrapped in its own `@layer` (pager/stack/cluster/footer → `milpa.layouts`; stat/drawer → `milpa.components`; chart → `milpa.artifacts`); the governance brace-walk (`scripts/layer-guard.mjs`) fails `npm test` if any rule lands outside its layer.
- State via ARIA/native attributes, never `.is-*` classes.
- Closed palette: NO new tokens. Every value reuses existing tokens (verified present: `--space-2/3/4/6/10`, `--text-2xs/xs/sm/3xl/4xl`, `--viz-1..6` + `--viz-N-active`, `--surface`/`--border`/`--border-subtle`/`--border-strong`/`--text`/`--text-muted`/`--text-secondary`/`--accent-text`/`--focus`/`--radius-md`/`--shadow-lg`/`--dur-fast`/`--ease-standard`/`--font-mono`/`--font-display`). No literal colors, ramp tokens, `!important`, raw z-index, hardcoded durations (governance enforces).
- Zero published JS: behavior lives in each contract's `a11y.behavior`; demo JS lives only in proofs.
- New pieces get a `*.contract.json` in the house shape — **model each new contract on an existing simple layouts contract** (`layouts/milpa-cta-band.contract.json`): copy its `$schema` + top-level field set (`name, layer, version, status, class, element, summary, anatomy, variants, states, tokens, a11y, motion, examples`), fill for the new piece. Governance-required fields: `name, layer, version, class, summary, states, tokens, a11y`. `version` of all touched/new contracts = `"0.5.0"`. Contract count → **68**.
- Quality floor: AA contrast, light/dark parity, reduced-motion parity, keyboard `:focus-visible`, correct `aria-*`.
- Commits by explicit path (never `git commit -a`), unsigned (`git -c commit.gpgsign=false`). Trailers on every commit: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s`.
- Verification: `npm test` green (193 AA + governance + 68 contracts + drift + layer-guard); `verify:theme` ALL PASS; touched proofs browser-verified dark/light/mobile/keyboard/console.

---

## Task 1: `mui-pager` (standalone) + docs shell adopts it

**Files:**
- Modify: `layouts/milpa-layouts.css` (add the `mui-pager` cluster inside `@layer milpa.layouts`; REMOVE the `.mui-docs__pager*` rules — lines ~200-227 — and add a thin `.mui-docs .mui-pager` spacing modifier)
- Create: `layouts/milpa-pager.contract.json`
- Modify: `layouts/milpa-docs.contract.json` (note: the pager was extracted to `mui-pager`; `version` → `"0.5.0"`)
- Modify: `proof/docs.html` (migrate the pager markup from `mui-docs__pager*` to `mui-pager*`)

**Interfaces:**
- Produces: `.mui-pager`, `.mui-pager__link` (`--prev`/`--next`), `.mui-pager__dir`, `.mui-pager__title`.

- [ ] **Step 1: Add `mui-pager`, remove `mui-docs__pager`, add the docs modifier**

In `layouts/milpa-layouts.css`, DELETE the current `.mui-docs__pager` / `.mui-docs__pager-link` / `.mui-docs__pager-link:hover` / `:focus-visible` / `--next` / `.mui-docs__pager-dir` / `.mui-docs__pager-title` rules (the extracted idiom), and in their place (still inside `@layer milpa.layouts`) add the generic pager (no top margin — spacing is the consumer's) plus a docs spacing modifier that preserves today's look:

```css
/* pager — navegación prev/next entre páginas hermanas (docs, blog, cualquier
   secuencia). Grid de 2: sin prev, --next se ancla solo a la columna 2. Card
   silenciosa (idioma de la casa: la definición la da el borde). */
.mui-pager {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}
.mui-pager__link {
  display: block;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: border-color var(--dur-fast) var(--ease-standard);
}
.mui-pager__link:hover { border-color: var(--border-strong); }
.mui-pager__link:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mui-pager__link--next { grid-column: 2; text-align: end; }
.mui-pager__dir {
  display: block; margin-block-end: var(--space-1);
  font-family: var(--font-mono); font-size: var(--text-2xs);
  text-transform: uppercase; letter-spacing: var(--tracking-wide);
  color: var(--text-muted);
}
.mui-pager__title {
  display: block;
  font-family: var(--font-display); font-size: var(--text-sm);
  font-weight: var(--weight-medium); line-height: var(--leading-snug);
  color: var(--accent-text);
}
/* el shell docs mantiene su separación del artículo */
.mui-docs .mui-pager { margin-block-start: var(--space-10); }
```

- [ ] **Step 2: Create `layouts/milpa-pager.contract.json`**

Model it on `layouts/milpa-cta-band.contract.json` (copy `$schema` + the top-level field set). Fill: `name` "pager", `layer` "layout", `version` "0.5.0", `class` "mui-pager", `element` "nav", `summary` (prev/next navigation between sibling pages; silent-card links, `--next` anchors to column 2 when there's no prev), `anatomy` (`__link` with `--prev`/`--next`, `__dir`, `__title`), `variants` ({} or note the link modifiers), `states` ({}), `tokens` (list every token the CSS uses: `--space-1`, `--space-3`, `--space-4`, `--border-subtle`, `--border-strong`, `--radius-md`, `--dur-fast`, `--ease-standard`, `--focus`, `--font-mono`, `--text-2xs`, `--tracking-wide`, `--text-muted`, `--font-display`, `--text-sm`, `--weight-medium`, `--leading-snug`, `--accent-text`), `a11y` (contrast: title=accent-text/bg + dir=text-muted/bg gated; keyboard: each link focus-visible; behavior: wrap the two links in `<nav aria-label>`), `motion` (border-color transition; reduced-motion fine), `examples` (a prev+next and a next-only snippet).

- [ ] **Step 3: Note the extraction in the docs contract**

In `layouts/milpa-docs.contract.json`: bump `version` to `"0.5.0"` and, wherever it documents the pager, note the pager idiom now lives in the standalone `mui-pager` piece (the docs shell composes it via `.mui-docs .mui-pager`).

- [ ] **Step 4: Migrate the docs proof pager**

In `proof/docs.html`, find the pager markup (classes `mui-docs__pager`, `mui-docs__pager-link`, `mui-docs__pager-dir`, `mui-docs__pager-title`) and rename to the `mui-pager*` equivalents (`mui-docs__pager` → `mui-pager`, `mui-docs__pager-link` → `mui-pager__link`, `--next` modifier likewise, `-dir`/`-title` → `__dir`/`__title`). Keep the surrounding `<nav>` + `aria-label`. Ensure the container is inside `.mui-docs` so the spacing modifier applies.

- [ ] **Step 5: Verify + browser (controller)**

Run: `npm test` → PASS (rule inside layer; contract count 66 after this task; pager contract valid, no ghost tokens). The controller opens `proof/docs.html` and confirms the pager renders identically (prev/next cards, dir label, title, hover border, focus ring, keyboard) dark/light.

- [ ] **Step 6: Commit**

```bash
git add layouts/milpa-layouts.css layouts/milpa-pager.contract.json layouts/milpa-docs.contract.json proof/docs.html
git -c commit.gpgsign=false commit -m "feat(layouts): mui-pager standalone — extraído del shell docs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 2: `mui-stack` / `mui-cluster` (layout utilities)

**Files:**
- Modify: `layouts/milpa-layouts.css` (add both utilities inside `@layer milpa.layouts`)
- Create: `layouts/milpa-stack.contract.json`, `layouts/milpa-cluster.contract.json`
- Modify: `proof/saas.html` (a demo using both)

**Interfaces:**
- Produces: `.mui-stack` (+ `--sm`/`--lg`), `.mui-cluster` (+ `--sm`/`--lg`).

- [ ] **Step 1: Add the utilities CSS**

Inside `@layer milpa.layouts`:

```css
/* stack — columna con gap consistente (ritmo vertical). gap por variante de
   tamaño (mapeado a spacing tokens). */
.mui-stack { display: flex; flex-direction: column; gap: var(--space-4); }
.mui-stack--sm { gap: var(--space-2); }
.mui-stack--lg { gap: var(--space-6); }
/* cluster — fila que envuelve con gap + alineación (badges, botones, tags). */
.mui-cluster { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); }
.mui-cluster--sm { gap: var(--space-2); }
.mui-cluster--lg { gap: var(--space-6); }
```

- [ ] **Step 2: Create the two contracts**

Model each on `layouts/milpa-cta-band.contract.json`. For `milpa-stack.contract.json`: `name` "stack", `class` "mui-stack", `element` "div", `summary` (vertical flow with consistent gap; size variants map to spacing tokens), `variants` (`sm`/`lg`), `states` ({}), `tokens` (`--space-2`, `--space-4`, `--space-6`), `a11y` (presentational; no roles of its own). For `milpa-cluster.contract.json`: same shape, `name` "cluster", `class` "mui-cluster", `summary` (wrapping horizontal group, center-aligned, gap by size). Both `version` "0.5.0".

- [ ] **Step 3: Demo in saas**

In `proof/saas.html`, use `.mui-stack` to stack a small group vertically and `.mui-cluster` for a wrapping row of badges/buttons (replace an ad-hoc flex if one exists, or add a small demo block). Keep it representative, not decorative filler.

- [ ] **Step 4: Verify + browser (controller)**

Run: `npm test` → PASS (both inside layer; contract count 68 after this task). Controller confirms in `proof/saas.html`: the stack has even vertical rhythm; the cluster wraps with even gaps and stays center-aligned at narrow widths; dark/light fine.

- [ ] **Step 5: Commit**

```bash
git add layouts/milpa-layouts.css layouts/milpa-stack.contract.json layouts/milpa-cluster.contract.json proof/saas.html
git -c commit.gpgsign=false commit -m "feat(layouts): mui-stack / mui-cluster — utilidades de ritmo y agrupación

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 3: `mui-stat --lg` + `mui-drawer --docked`

**Files:**
- Modify: `components/milpa-components.css` (add `.mui-stat--lg` near the stat cluster ~line 282; add `.mui-drawer--docked` near the drawer cluster ~line 815 — both inside `@layer milpa.components`)
- Modify: `components/milpa-stat.contract.json` (`--lg` variant; `version` "0.5.0"), `components/milpa-drawer.contract.json` (`--docked` variant + the docked≠dialog note; `version` "0.5.0")
- Modify: `proof/saas.html` (a large KPI stat + a docked side panel)

**Interfaces:**
- Produces: `.mui-stat--lg`, `.mui-drawer--docked`.

- [ ] **Step 1: `mui-stat --lg`**

After the stat rules in `components/milpa-components.css`:
```css
/* --lg: hero-stat / KPI destacado — solo el valor sube de tamaño */
.mui-stat--lg .mui-stat__value { font-size: var(--text-4xl); }
```

- [ ] **Step 2: `mui-drawer --docked`**

After the drawer rules (~line 815):
```css
/* docked — panel lateral PERSISTENTE, no modal. Se usa sobre un <aside>
   estático (region/landmark), NO un <dialog>: reusa la piel del drawer pero
   fluye en el layout — sin fixed, sin backdrop, sin [open], sin animación.
   docked ≠ dialog (no atrapa foco ni cierra con Esc; ver contrato). */
.mui-drawer--docked {
  position: static;
  inset: auto;
  height: 100%; max-height: none;
  width: auto; max-width: none;
  margin: 0;
  display: flex; flex-direction: column;
  border-inline-start: 1px solid var(--border);
  box-shadow: none;
  animation: none;
}
```

- [ ] **Step 3: Update the two contracts**

`components/milpa-stat.contract.json`: add `"lg"` to `variants` ("valor a mayor escala para hero-stats/KPIs destacados"), `version` "0.5.0". `components/milpa-drawer.contract.json`: add `"docked"` to `variants` ("panel lateral persistente sobre un `<aside>` estático — NO modal; sin backdrop/foco-trap/Esc/animación"), and in `a11y.behavior` note that `--docked` is a landmark region, not a dialog (no `showModal`, no focus trap, no Esc). `version` "0.5.0".

- [ ] **Step 4: Demo in saas**

In `proof/saas.html`: (a) render one stat with `.mui-stat--lg` (a headline metric); (b) add a docked side panel — `<aside class="mui-drawer mui-drawer--docked" aria-label="…">…</aside>` inside a 2-column layout region (persistent, no toggle). Keep both representative.

- [ ] **Step 5: Verify + browser (controller)**

Run: `npm test` → PASS (both inside `@layer milpa.components`; contract count stays 68). Controller confirms: the `--lg` stat value is visibly larger; the docked aside is static (in flow, no backdrop, always visible, no slide animation), keyboard tab passes through it normally (no trap); dark/light fine.

- [ ] **Step 6: Commit**

```bash
git add components/milpa-components.css components/milpa-stat.contract.json components/milpa-drawer.contract.json proof/saas.html
git -c commit.gpgsign=false commit -m "feat(components): mui-stat --lg + mui-drawer --docked (panel persistente, no modal)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 4: `mui-chart --line` + HTML ticks

**Files:**
- Modify: `artifacts/milpa-artifacts.css` (add `.mui-chart--line` + `.mui-chart__ticks`/`.mui-chart__tick` near the chart cluster, inside `@layer milpa.artifacts`)
- Modify: `artifacts/milpa-chart.contract.json` (`--line` variant + `__ticks`/`__tick` anatomy; `version` "0.5.0")
- Modify: a proof (`proof/saas.html` or `proof/docs.html`) with a line chart + ticks

**Interfaces:**
- Produces: `.mui-chart--line`, `.mui-chart__ticks`, `.mui-chart__tick`. The consumer supplies the line as an inline `<svg><polyline>/<path></svg>` in `.mui-chart__canvas` (per the chart's data-injection convention).

- [ ] **Step 1: Add the line + ticks CSS**

Inside `@layer milpa.artifacts`, after the chart cluster:
```css
/* --line: gráfico de línea. El consumidor siembra un <svg> con <polyline>/<path>
   en el canvas; el trazo usa la paleta viz (--_c hereda la serie). fill:none. */
.mui-chart--line .mui-chart__canvas { height: var(--_h); }
.mui-chart--line .mui-chart__canvas :is(svg) { width: 100%; height: 100%; display: block; overflow: visible; }
.mui-chart--line .mui-chart__canvas :is(polyline, path) {
  fill: none;
  stroke: var(--_c, var(--viz-1));
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
/* ticks del eje x en HTML (el <text> SVG se distorsiona bajo el viewBox):
   fila equiespaciada, categorías. mono/muted como los ejes. */
.mui-chart__ticks {
  display: flex; justify-content: space-between;
  font-family: var(--font-mono); font-size: var(--text-2xs);
  color: var(--text-muted);
}
.mui-chart__tick { flex: none; }
```

- [ ] **Step 2: Update the chart contract**

`artifacts/milpa-chart.contract.json`: add `"line"` to `variants` ("gráfico de línea; el consumidor inyecta un `<svg>` polyline/path en el canvas, trazo por `--viz`/`--_c`"), add `__ticks`/`__tick` to `anatomy` ("fila de ticks del eje en HTML — el `<text>` SVG se distorsiona; `flex space-between`, categorías equiespaciadas; `aria-hidden` si el eje ya está en el fallback textual"). `version` "0.5.0".

- [ ] **Step 3: Demo the line chart**

In the chosen proof, add a `.mui-chart.mui-chart--line` with: a title, a `.mui-chart__canvas` holding an inline `<svg viewBox="0 0 100 40" preserveAspectRatio="none">` with a `<polyline points="…" style="--_c: var(--viz-2)">`, a `.mui-chart__ticks` row of `.mui-chart__tick` spans (e.g. month labels), and the accessible fallback the chart contract requires (aria-label summary or a `.mui-sr-only` table). Ticks `aria-hidden="true"` if the axis is already described in the fallback.

- [ ] **Step 4: Verify + browser (controller)**

Run: `npm test` → PASS (inside `@layer milpa.artifacts`; contract count stays 68). Controller confirms: the line renders with the viz stroke (not distorted), the HTML ticks sit evenly under the canvas and are crisp (no SVG-text distortion), dark/light fine, the accessible fallback present.

- [ ] **Step 5: Commit**

```bash
git add artifacts/milpa-artifacts.css artifacts/milpa-chart.contract.json proof/saas.html
git -c commit.gpgsign=false commit -m "feat(artifacts): mui-chart --line + ticks HTML (el <text> SVG se distorsiona)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

(Adjust `git add` to the actual proof file you demoed in.)

---

## Task 5: Footer mantra slot (D6) + media-gallery thumbs JS (D7)

**Files:**
- Modify: `layouts/milpa-footer.contract.json` (document `__mantra` as a generic product-tagline slot; `version` "0.5.0")
- Modify: `components/milpa-media-gallery.contract.json` (thumbs swap behavior in `a11y.behavior`; `version` "0.5.0")
- Modify: `proof/saas.html` (footer `__mantra` shows a NON-Milpa tagline) and `proof/commerce.html` (PDP thumbs swap JS)

**Interfaces:**
- Consumes: existing `.mui-footer__mantra`, `.mui-media-gallery__thumb[aria-current]`.

- [ ] **Step 1: Document the footer mantra slot**

In `layouts/milpa-footer.contract.json`: in `anatomy`, make `__mantra`'s description explicit that it is the **product's own tagline** (any product — optional slot; not hardcoded to Milpa's mantra). `version` "0.5.0". No CSS change (`.mui-footer__mantra` is already generic mono/muted).

- [ ] **Step 2: Demo a non-Milpa mantra**

In `proof/saas.html` (the Troje product), set the footer's `.mui-footer__mantra` to Troje's OWN tagline (a product-appropriate line, `lang` as appropriate), demonstrating the slot isn't Milpa-branded. (If saas already uses the Milpa mantra there, change it to the product's.)

- [ ] **Step 3: Document the thumbs behavior**

In `components/milpa-media-gallery.contract.json` → `a11y.behavior`, add: clicking a `.mui-media-gallery__thumb` swaps the `.mui-media-gallery__main` content/`src` to that thumb's and moves `aria-current="true"` to the active thumb (removing it from the previous); thumbs are focusable and Enter/Space activate; the main image's alt updates to match. `version` "0.5.0".

- [ ] **Step 4: Add the reference thumbs JS to commerce**

In `proof/commerce.html` (PDP), wire the gallery thumbs with the reference JS:
```js
/* ---------- media-gallery: thumb → swap main + aria-current ---------- */
document.querySelectorAll('.mui-media-gallery').forEach((gal) => {
  const main = gal.querySelector('.mui-media-gallery__main');
  const thumbs = [...gal.querySelectorAll('.mui-media-gallery__thumb')];
  const select = (thumb) => {
    thumbs.forEach((t) => t.removeAttribute('aria-current'));
    thumb.setAttribute('aria-current', 'true');
    const src = thumb.querySelector(':is(img, svg, picture)');
    const dst = main.querySelector(':is(img, svg, picture)');
    if (src && dst) dst.replaceWith(src.cloneNode(true));  // swap the visual
  };
  thumbs.forEach((t) => t.addEventListener('click', () => select(t)));
});
```
Ensure the PDP gallery markup has a `.mui-media-gallery__main` + at least two `.mui-media-gallery__thumb` (add a small set if missing), each thumb a focusable `<button>` with `aria-current` on the first.

- [ ] **Step 5: Verify + browser (controller)**

Run: `npm test` → PASS (contract count stays 68; both contracts valid). Controller confirms: saas footer shows the product's tagline (not Milpa's); commerce PDP thumbs swap the main image on click and move `aria-current`, keyboard-activatable; console clean.

- [ ] **Step 6: Commit**

```bash
git add layouts/milpa-footer.contract.json components/milpa-media-gallery.contract.json proof/saas.html proof/commerce.html
git -c commit.gpgsign=false commit -m "feat(0.5): footer mantra como slot de producto + thumbs swap JS de referencia

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Task 6: Close-out — AA audit, version, CHANGELOG, docs, final gate

**Files:**
- Modify: `scripts/contrast-pairs.mjs` (ONLY if the audit finds a new pair — expected none)
- Modify: `package.json` (version), `CHANGELOG.md`, `README.md`, `HANDOFF.md`

- [ ] **Step 1: AA-pairs audit**

Every new surface reuses gated pairs: pager title = `--accent-text`/bg (gated), dir = `--text-muted`/bg (gated); stack/cluster carry no color; stat `--lg` value = `--text`/surface|bg (gated); drawer docked reuses the drawer's `--text`/`--surface` (gated); chart line stroke = `--viz-*` (UI 3:1, gated) and ticks = `--text-muted`/bg (gated); footer mantra = `--text-muted`/bg (gated). **Expected: 0 new pairs.** Add to `PAIRS` ONLY if a genuinely new fg/bg combo appears; otherwise leave `contrast-pairs.mjs` unchanged and note "audit: 0 new pairs."

- [ ] **Step 2: Version bump** — `package.json` `"0.4.0"` → `"0.5.0"`.

- [ ] **Step 3: CHANGELOG** — prepend `## [0.5.0] — 2026-07-04` (titled «la mano») under `## [Unreleased]`, house voice. Added: `mui-pager` (standalone, extraído del shell docs), `mui-stack`/`mui-cluster` (utilidades de ritmo/agrupación), `mui-stat --lg`, `mui-drawer --docked` (panel persistente, no modal), `mui-chart --line` + ticks HTML, footer mantra como slot de producto, thumbs swap JS de referencia. Changed: contratos **65 → 68** (nuevos `mui-pager`/`mui-stack`/`mui-cluster`; resto variantes/behaviors); el shell docs compone `mui-pager`.

- [ ] **Step 4: Docs** — `README.md`: conteo 65 → 68. `HANDOFF.md` §4: marcá el **cluster D** hecho (los 7 items); **mantené abiertos** los hallazgos **F** (#8/#9/#10) y los 2 Minors de 0.3.

- [ ] **Step 5: Final verification** — `npm test` → PASS (193 AA + governance brace-walk + 68 contratos + drift + layer-guard). `npm run verify:theme -- proof/themed-skin.css` → ALL PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json CHANGELOG.md README.md HANDOFF.md
git -c commit.gpgsign=false commit -m "chore(release): @milpa/design 0.5.0 «la mano» — versión, changelog, docs

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Y1KzQQVduS83c6ZArZZ96s"
```

---

## Out of scope (deferred to later specs)

- Findings **F**: off-canvas → `<dialog>` (header + docs shell), `mui-header` mobile-actions pattern, media `:is()` `<picture>` descendant-combinator.
- The 2 deferred 0.3 Minors: `card__media` `[hidden]` guard policy, gallery `show(i)` empty-set guard.
- Publishing to npm + creating the `v0.5.0` git tag/GitHub Release — **Rod's action** (npm OTP/2FA and the outward-facing tag push). Tag unsigned (`-c tag.gpgSign=false`), release notes mirror the CHANGELOG.

## Self-review notes (author)

- **Spec coverage:** D1 (Task 1) · D3 (Task 2) · D2+D4 (Task 3) · D5 (Task 4) · D6+D7 (Task 5) · close-out (Task 6). All spec sections mapped.
- **Type/name consistency:** `.mui-pager*` identical across CSS/contract/proof; `.mui-stack`/`.mui-cluster` (+`--sm`/`--lg`) consistent; `.mui-stat--lg`, `.mui-drawer--docked`, `.mui-chart--line`/`__ticks`/`__tick` consistent CSS↔contract↔proof. The thumbs JS selects `.mui-media-gallery__thumb`/`__main` matching the contract's anatomy.
- **No placeholders:** every CSS/JS step carries real content; contracts specify shape (model on milpa-cta-band) + full field content; all tokens pre-verified present in `dist/milpa-tokens.css`.
