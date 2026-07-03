# @milpa/design 0.2.0 — Docs versionadas, artefactos, layouts y theming — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.
>
> **Modelo de ejecución de este repo:** las tareas mecánicas (F1, tokens, gates, package.json)
> se ejecutan tal cual están escritas. Las tareas de autoría de componentes (F2–F5) se ejecutan
> con la maquinaria probada del repo: **Workflow de clusters → verificación adversarial (ratios
> de contraste computados con node) → fix → ensamblado determinista** (los agentes devuelven CSS
> por StructuredOutput; un solo proceso escribe los archivos). El spec de cada componente en su
> tarea es el contrato de entrada del cluster.

**Goal:** Publicar `@milpa/design@0.2.0`: capa de contenido/documentación (artefactos + layouts + docs versionadas) y contrato de theming inyectable vía CSS cascade layers.

**Architecture:** Todo el CSS publicado pasa a `@layer milpa.*` (el override del plugin gana por definición); dos bundles nuevos `artifacts/` y `layouts/`; los casos de uso son proofs compuestos; `theme.contract.json` (generado, drift-gated) exporta tokens requeridos + pares AA como datos.

**Tech Stack:** CSS puro + contratos JSON + scripts node cero-dependencias (`build-tokens.mjs`, `verify-contrast.mjs`, `verify-governance.mjs`). Sin JS publicado (el comportamiento va en `a11y.behavior` de cada contrato).

**Spec:** `docs/superpowers/specs/2026-07-02-milpa-docs-layouts-theming-design.md`

## Global Constraints

- **Quality floor (DESIGN §6, no negociable):** contraste AA (4.5 texto / 3:1 UI), paridad light/dark, paridad reduced-motion, teclado + `:focus-visible`, `aria-*` correctos.
- `<html>` **siempre** lleva `data-theme` (`"dark"` | `"light"`).
- Naming: clases `mui-*`; tokens `--{categoría}-{nombre}`; contratos `{componente}.contract.json`.
- **Estados vía atributos ARIA/nativos** (`[disabled]`, `[aria-invalid]`, `[aria-busy]`, `[aria-selected]`, `[aria-current]`, `[aria-sort]`, `:checked`) — nunca clases de estado.
- **Auto-borde:** todo fill sólido lleva `border-color` = su token `-active`.
- Solo tokens **semánticos** en CSS de componentes (nada de rampas `--oro-300` etc.; privados `--_x` permitidos). Sin hex/rgb/hsl, sin `!important`, sin z-index crudo, sin duraciones hardcodeadas.
- El oro **nunca** es fill sólido en light (primario light = ghost). Olivo (~124°) lejos de success (~150°).
- Paleta **cerrada**: tierra/oro/olivo/cielo + success/warning/danger. Los tokens nuevos (`--syntax-*`, `--viz-*`) se definen POR REFERENCIA a esas rampas en el DTCG.
- Orden canónico de capas (cada archivo CSS publicado lo declara íntegro en su primera línea de código):
  `@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;`
- Idioma: proofs/landing/docs en **inglés**; el tagline "Siembra módulos, cosecha aplicaciones." queda en español, verbatim. Docs internos del repo en español.
- Cada tarea termina con `npm test` en verde y commit. No tocar identificadores legacy del framework (`Timored\Medusa\`, `php mds`).
- `landing/index.html` está **staged de otra sesión**: commitear siempre por path explícito (`git commit <paths>`), nunca `git commit -a` ni `git commit` a secas.

## Mapa de archivos (quién es responsable de qué)

```
scripts/contrast-pairs.mjs        NUEVO   los pares AA como datos (única fuente de verdad)
scripts/build-tokens.mjs          MOD     emite @layer en dist + theme.contract.json
scripts/verify-contrast.mjs       MOD     importa PAIRS de contrast-pairs.mjs
scripts/verify-governance.mjs     MOD     regla @layer + dirs artifacts/layouts
scripts/verify-theme.mjs          NUEVO   validador de referencia para themes inyectados
theme.contract.json               GEN     contrato de theming (drift-gated)
THEMING.md                        NUEVO   el contrato explicado (3 niveles de inyección)
tokens/milpa-tokens.json          MOD     + theme.*.syntax-* y viz-*
dist/*                            GEN     regenerados con @layer
motion/milpa-motion.css           MOD     wrap @layer milpa.motion
primitives/milpa-primitives.css   MOD     wrap @layer milpa.primitives + badge variants
components/milpa-components.css   MOD     wrap @layer milpa.components + commerce (F4)
artifacts/milpa-artifacts.css     NUEVO   el elote (12 piezas F2 + kit versionado F3)
artifacts/*.contract.json         NUEVO   15 contratos
layouts/milpa-layouts.css         NUEVO   la parcela (mui-docs F3 + vocabulario F4)
layouts/*.contract.json           NUEVO   11 contratos
components/milpa-{product-card,price,rating,media-gallery,cart-line}.contract.json  NUEVO (F4)
proof/{docs,blog,commerce,gallery,saas,themed}.html                                 NUEVO (F3/F5)
landing/index.html                MOD     inglés + vocabulario mui-* (F6)
package.json / README.md / CHANGELOG.md / HANDOFF.md / DESIGN.md                    MOD (por fase / F6)
```

---

# FASE 1 · Cascada + contrato (fundación)

### Task 1: Extraer los pares AA a `scripts/contrast-pairs.mjs`

**Files:**
- Create: `scripts/contrast-pairs.mjs`
- Modify: `scripts/verify-contrast.mjs:28-73` (borrar el array inline, importar)

**Interfaces:**
- Produces: `export const PAIRS` — array de `[fgRole, bgRole, min, themes?]` (mismos 52 pares actuales, sin cambio de contenido). `export const INVARIANTS` — array de strings.

- [ ] **Step 1: Crear `scripts/contrast-pairs.mjs`** moviendo el array `PAIRS` COMPLETO y VERBATIM desde `verify-contrast.mjs` (líneas 31–73, con todos sus comentarios), con este header y agregando `INVARIANTS`:

```js
/**
 * contrast-pairs.mjs — los pares de contraste del quality floor COMO DATOS.
 * Única fuente de verdad: los consume verify-contrast.mjs (gate de CI) y
 * build-tokens.mjs (los emite dentro de theme.contract.json para que el
 * framework pueda validar themes inyectados). Formato:
 *   [ fg-role, bg-role, min, themes? ]   themes opcional restringe el par.
 */
export const PAIRS = [
  /* …el array actual completo, verbatim, con comentarios… */
];

export const INVARIANTS = [
  'reduced-motion parity: every animated affordance has a non-animated equivalent (see motion/milpa-motion.css contract)',
  'focus-visible: interactive elements show a visible :focus-visible outline (--focus) >= 3:1 against its background',
  'data-theme: <html> always carries data-theme="dark" | "light", never absent',
  'gold is never a solid fill in light theme (light primary = ghost)',
];
```

- [ ] **Step 2:** En `verify-contrast.mjs`: reemplazar el bloque `const PAIRS = [...]` por `import { PAIRS } from './contrast-pairs.mjs';` (va junto a los otros imports; dejar el comentario de formato encima del import).
- [ ] **Step 3:** Run `npm test` → Expected: `ALL PASS ✓  (135 checks)` + governance + drift, idéntico a antes.
- [ ] **Step 4:** Commit: `git add scripts/ && git commit scripts/ -m "refactor(gate): pares AA extraídos a contrast-pairs.mjs — datos, no código"`

### Task 2: `build-tokens.mjs` emite `@layer` y `theme.contract.json`

**Files:**
- Modify: `scripts/build-tokens.mjs`
- Generate: `dist/milpa-tokens.css`, `dist/tailwind.config.js`, `theme.contract.json`
- Modify: `package.json` (exports/files)

**Interfaces:**
- Consumes: `PAIRS`, `INVARIANTS` de `scripts/contrast-pairs.mjs` (Task 1).
- Produces: `theme.contract.json` en la raíz; `dist/milpa-tokens.css` envuelto en `@layer milpa.tokens`; constante exportable del orden de capas: `LAYER_ORDER`.

- [ ] **Step 1:** En `build-tokens.mjs`, agregar imports y constante (tras la línea 30):

```js
import { PAIRS, INVARIANTS } from './contrast-pairs.mjs';

export const LAYER_ORDER =
  '@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;';
```

- [ ] **Step 2:** Envolver el CSS generado. En el template inicial (línea 40), después del comentario header agregar:

```js
let css = `/* …header comment igual que hoy… */

${LAYER_ORDER}

@layer milpa.tokens {

/* ===== color: primitives ===== */
:root {
`;
```

y después del `themeBlock('light', …)` (línea 113) cerrar la capa:

```js
css += '\n} /* @layer milpa.tokens */\n';
```

Sumar al header comment la línea: `Cascada: todo el CSS publicado vive en @layer milpa.* — el CSS sin layer del consumidor/plugin SIEMPRE gana (THEMING.md).`

- [ ] **Step 3:** Emitir el theme contract. Antes del bloque `---------- write / check ----------`:

```js
// ---------- theme.contract.json ----------
const themeContract = JSON.stringify({
  name: 'milpa-theme',
  layer: 'theme',
  summary: 'Contract every injected theme/skin must honor. Generated from tokens + contrast-pairs.mjs — do not edit by hand (npm run build).',
  cascade: {
    order: LAYER_ORDER,
    rule: 'All published Milpa CSS lives in @layer milpa.*. Un-layered (or later-layered) consumer/plugin CSS always wins — no !important, no specificity wars.',
    levels: [
      'L1 retokenize: override custom properties only (colors, type, radius, motion). Layout & a11y intact.',
      'L2 reskin: add your own un-layered CSS replacing any mui-* skin or adding components.',
      'L3 replace: skip Milpa component/artifact/layout bundles entirely; honor requiredTokens + contrast + invariants.',
    ],
  },
  requiredTokens: {
    color: entries(tok.theme.dark).map(([n]) => `--${n}`),
    type: [
      ...entries(tok.fontFamily).map(([k]) => `--font-${k}`),
      ...entries(tok.fontSize).map(([k]) => `--text-${k}`),
      ...entries(tok.lineHeight).map(([k]) => `--leading-${k}`),
      ...entries(tok.fontWeight).map(([k]) => `--weight-${k}`),
      ...entries(tok.letterSpacing).map(([k]) => `--tracking-${k}`),
    ],
    space: entries(tok.space).map(([k]) => `--space-${k}`),
    radius: entries(tok.radius).map(([k]) => `--radius-${k}`),
    zIndex: entries(tok.zIndex).map(([k]) => `--z-${k}`),
    motion: [
      ...entries(tok.duration).map(([k]) => `--dur-${k}`),
      ...entries(tok.easing).map(([k]) => `--ease-${k}`),
      ...entries(tok.stagger).map(([k]) => `--stagger-${k}`),
      ...entries(tok.rise).map(([k]) => `--rise-${k}`),
    ],
    elevation: entries(tok.elevation.dark).map(([k]) => `--shadow-${k}`),
  },
  contrast: {
    algorithm: 'WCAG 2.1 relative luminance',
    themes: ['dark', 'light'],
    pairs: PAIRS.map(([fg, bg, min, themes]) =>
      ({ fg: `--${fg}`, bg: `--${bg}`, min, ...(themes ? { themes } : {}) })),
  },
  invariants: INVARIANTS,
}, null, 2) + '\n';
```

y en `OUT`: `const OUT = { 'dist/milpa-tokens.css': css, 'dist/tailwind.config.js': tw, 'theme.contract.json': themeContract };` — el drift gate lo cubre automáticamente.

- [ ] **Step 4:** `package.json`: en `exports` agregar `"./theme": "./theme.contract.json"` y `"./package.json": "./package.json"` (la nota 0.1.1 del HANDOFF); en `files` agregar `"theme.contract.json"` y `"THEMING.md"`.
- [ ] **Step 5:** Run `npm run build` → escribe los 3 archivos. Run `npm test` → Expected: 135 AA + governance + `OK` en los TRES archivos del drift gate. (Governance lee `dist/milpa-tokens.css` para `defined` — el regex `--([\w-]+)\s*:` sigue matcheando dentro del layer.)
- [ ] **Step 6:** Commit: `git add scripts/build-tokens.mjs dist/ theme.contract.json package.json && git commit scripts/build-tokens.mjs dist/ theme.contract.json package.json -m "feat(theming): @layer milpa.tokens + theme.contract.json generado (drift-gated)"`

### Task 3: Envolver motion/primitives/components en sus capas

**Files:**
- Modify: `motion/milpa-motion.css`, `primitives/milpa-primitives.css`, `components/milpa-components.css`

**Interfaces:**
- Produces: cada archivo declara `LAYER_ORDER` como primera línea de código y envuelve TODO su contenido en `@layer milpa.{motion|primitives|components} { … }`.

- [ ] **Step 1:** En cada uno de los 3 archivos: tras el comentario header, insertar (con su capa correspondiente):

```css
@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;

@layer milpa.primitives {
```

y como última línea del archivo: `} /* @layer milpa.primitives */`. Sumar al header de cada archivo una línea: `Cascada: este archivo vive en @layer — el CSS del consumidor/plugin gana sin !important (THEMING.md).`
- [ ] **Step 2:** Run `npm test` → Expected: todo en verde (el wrap agrega 1 llave que abre y 1 que cierra: el balance se mantiene; nada más cambia).
- [ ] **Step 3:** Verificación visual rápida: `npm run proof` → abrir `proof/milpa-admin-proof.html` en dark y light; nada debe verse distinto (las capas no cambian el resultado si no hay CSS externo compitiendo).
- [ ] **Step 4:** Commit: `git add motion/ primitives/ components/ && git commit motion/ primitives/ components/ -m "feat(theming): CSS publicado en @layer milpa.* — el override del plugin gana por definición"`

### Task 4: Regla de governance: todo CSS publicado declara su capa

**Files:**
- Modify: `scripts/verify-governance.mjs`

**Interfaces:**
- Consumes: los wraps de Task 2/3.
- Produces: `LAYERED` map — extendido por F2 (artifacts) y F3 (layouts).

- [ ] **Step 1:** Tras la línea 14 (`const CONTRACT_DIRS…`) agregar:

```js
// Regla @layer: todo CSS publicado declara el orden canónico completo y envuelve
// sus reglas en su propia capa (THEMING.md). dist/ lo garantiza el generador+drift.
const LAYER_ORDER =
  '@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;';
const LAYERED = {
  'motion/milpa-motion.css': 'milpa.motion',
  'primitives/milpa-primitives.css': 'milpa.primitives',
  'components/milpa-components.css': 'milpa.components',
};
```

- [ ] **Step 2:** Después del loop de `CSS_FILES` agregar el check:

```js
console.log('\n@layer');
for (const [file, layer] of Object.entries(LAYERED)) {
  const raw = readFileSync(join(root, file), 'utf8');
  raw.includes(LAYER_ORDER) ? pass(`${file}: declara el orden canónico`) : fail(`${file}: falta la declaración @layer canónica`);
  raw.includes(`@layer ${layer} {`) ? pass(`${file}: envuelto en @layer ${layer}`) : fail(`${file}: no envuelve sus reglas en @layer ${layer}`);
}
```

- [ ] **Step 3:** Run `npm test` → Expected: `ALL PASS ✓ (governance)` con los 6 checks nuevos. Prueba negativa: borrar temporalmente la primera línea `@layer` de `motion/milpa-motion.css`, correr `node scripts/verify-governance.mjs` → debe FALLAR; restaurar.
- [ ] **Step 4:** Commit: `git add scripts/verify-governance.mjs && git commit scripts/verify-governance.mjs -m "feat(gate): governance verifica @layer en todo CSS publicado"`

### Task 5: `THEMING.md`

**Files:**
- Create: `THEMING.md`

- [ ] **Step 1:** Escribir `THEMING.md` (en español, como DESIGN.md; ~120 líneas) con exactamente estas secciones:
  1. **Qué es** — el contrato de inyección de look & feel para plugins. La costura: `theme.contract.json` (generado, no editar) + este documento.
  2. **Cómo funciona la cascada** — el orden `@layer milpa.*` completo; regla citada verbatim: *"el CSS sin layer (o en una capa posterior) del consumidor/plugin SIEMPRE gana — sin `!important`, sin guerras de especificidad"*. Snippet mínimo de consumo (los 4 imports + un override de ejemplo).
  3. **Nivel 1 · Retokenizar** — override de custom properties; ejemplo real de ~10 tokens (`--accent`, `--font-display`, `--radius-*`…); qué queda intacto (layout, a11y, reduced-motion).
  4. **Nivel 2 · Reskin** — CSS propio sin layer reemplazando la piel de un `mui-*`; ejemplo: re-skin de `.mui-btn--primary`.
  5. **Nivel 3 · Reemplazo total** — no importar components/artifacts/layouts; qué DEBE seguir cumpliendo: `requiredTokens`, pares de `contrast`, `invariants` (citar los 4 invariants verbatim de `contrast-pairs.mjs`).
  6. **Validación** — `node scripts/verify-theme.mjs <css-del-theme>` (referencia, llega en F5); a futuro `coa` valida al instalar.
  7. **Qué NO hacer** — `!important` contra las capas; acercar olivo a success; oro como fill en light; romper reduced-motion.
- [ ] **Step 2:** Run `npm test` (sin cambios de código, sanity) → verde.
- [ ] **Step 3:** Commit: `git add THEMING.md && git commit THEMING.md -m "docs(theming): THEMING.md — los 3 niveles de inyección y el contrato"`

---

# FASE 2 · Tokens nuevos + artefactos (el elote)

### Task 6: Tokens `--syntax-*` y `--viz-*` en el DTCG + pares al gate

**Files:**
- Modify: `tokens/milpa-tokens.json` (bloques `theme.dark` y `theme.light`)
- Modify: `scripts/contrast-pairs.mjs`
- Generate: `dist/*`, `theme.contract.json` (npm run build)

**Interfaces:**
- Produces: tokens semánticos `--syntax-bg`, `--syntax-text`, `--syntax-keyword`, `--syntax-string`, `--syntax-comment`, `--syntax-function`, `--syntax-number`, `--syntax-punctuation`, `--syntax-variable`, `--syntax-tag`, `--syntax-attribute`, `--viz-1`…`--viz-6`. Los consumen F2–F5.

- [ ] **Step 1:** En `tokens/milpa-tokens.json`, dentro de `theme.dark` agregar (mismo formato `{ "$value": "{color.ramp.step}" }` que los existentes; con `$description` en el primero: "syntax highlighting — cada color verificado AA 4.5:1 sobre syntax-bg en ambos temas; el highlighter (Shiki/Prism) solo mapea a estas variables"):

```
syntax-bg: {color.tierra.950}      syntax-text: {color.tierra.50}
syntax-keyword: {color.oro.300}    syntax-string: {color.olivo.400}
syntax-comment: {color.tierra.400} syntax-function: {color.warning.400}
syntax-number: {color.cielo.400}   syntax-punctuation: {color.tierra.300}
syntax-variable: {color.tierra.50} syntax-tag: {color.danger.400}
syntax-attribute: {color.success.400}
viz-1: {color.oro.300}   viz-2: {color.cielo.400}  viz-3: {color.olivo.400}
viz-4: {color.danger.400} viz-5: {color.tierra.300} viz-6: {color.warning.400}
```

y en `theme.light`:

```
syntax-bg: {color.tierra.50}       syntax-text: {color.tierra.950}
syntax-keyword: {color.oro.700}    syntax-string: {color.olivo.700}
syntax-comment: {color.tierra.700} syntax-function: {color.warning.700}
syntax-number: {color.cielo.700}   syntax-punctuation: {color.tierra.800}
syntax-variable: {color.tierra.950} syntax-tag: {color.danger.700}
syntax-attribute: {color.success.700}
viz-1: {color.oro.600}   viz-2: {color.cielo.700}  viz-3: {color.olivo.700}
viz-4: {color.danger.700} viz-5: {color.tierra.700} viz-6: {color.warning.700}
```

(Racional: en dark, los `-400`/oro-300 ya prueban ≥4.5 sobre tierra-950 en el gate actual; en light, los `-700` ya prueban ≥4.5 sobre tierra-50 vía los pares `X/surface`. `viz-5` light usa tierra-700 = muted, 4.5 ✓.)

- [ ] **Step 2:** En `scripts/contrast-pairs.mjs` agregar al final de `PAIRS`:

```js
  // --- artifacts: código y terminal (todo sobre --syntax-bg) ---
  ['syntax-text', 'syntax-bg', 4.5], ['syntax-keyword', 'syntax-bg', 4.5],
  ['syntax-string', 'syntax-bg', 4.5], ['syntax-comment', 'syntax-bg', 4.5],
  ['syntax-function', 'syntax-bg', 4.5], ['syntax-number', 'syntax-bg', 4.5],
  ['syntax-punctuation', 'syntax-bg', 4.5], ['syntax-variable', 'syntax-bg', 4.5],
  ['syntax-tag', 'syntax-bg', 4.5], ['syntax-attribute', 'syntax-bg', 4.5],
  ['text-secondary', 'syntax-bg', 4.5], ['text-muted', 'syntax-bg', 4.5], // header de mui-code / prompt
  ['border-strong', 'syntax-bg', 3],   // boundary del bloque y del botón copiar
  ['success', 'syntax-bg', 4.5], ['danger', 'syntax-bg', 4.5], // líneas diff +/-
  ['focus', 'syntax-bg', 3],
  // --- artifacts: paleta categórica de charts (fills 3:1 sobre ambos fondos) ---
  ['viz-1', 'bg', 3], ['viz-2', 'bg', 3], ['viz-3', 'bg', 3],
  ['viz-4', 'bg', 3], ['viz-5', 'bg', 3], ['viz-6', 'bg', 3],
  ['viz-1', 'surface', 3], ['viz-2', 'surface', 3], ['viz-3', 'surface', 3],
  ['viz-4', 'surface', 3], ['viz-5', 'surface', 3], ['viz-6', 'surface', 3],
```

- [ ] **Step 3:** Run `npm run build && npm test` → Expected: `ALL PASS ✓  (191 checks)` (135 + 28 pares × 2 temas). Si algún par falla, ajustar el step de rampa de ESE token (subir/bajar un paso) y re-correr — el gate es el árbitro, no el ojo.
- [ ] **Step 4:** Verificación extra de la paleta viz (daltonismo): computar con node la separación de matiz/luminancia entre `viz-1..6` por tema (script one-off en scratchpad usando las fórmulas de `verify-contrast.mjs`); criterio: ningún par de la paleta con ΔY < 0.05 **y** matiz similar. Documentar el resultado en el `$description` de `viz-1`.
- [ ] **Step 5:** Commit: `git add tokens/ dist/ theme.contract.json scripts/contrast-pairs.mjs && git commit tokens/ dist/ theme.contract.json scripts/contrast-pairs.mjs -m "feat(tokens): --syntax-* AA-verificado y paleta --viz-* — 191 checks"`

### Task 7: Bundle `artifacts/` — las 12 piezas de contenido (Workflow: clusters + verify adversarial)

**Files:**
- Create: `artifacts/milpa-artifacts.css` (~700–900 líneas, ensamblado determinista)
- Create: 12 contratos: `artifacts/milpa-{code,terminal,code-group,chart,quote,callout,api,steps,file-tree,prose,toc,search}.contract.json`
- Modify: `scripts/verify-governance.mjs` (CSS_FILES += artifacts css; CONTRACT_DIRS += 'artifacts'; LAYERED += `'artifacts/milpa-artifacts.css': 'milpa.artifacts'`)
- Modify: `package.json` (exports `"./artifacts.css": "./artifacts/milpa-artifacts.css"`, `"./artifacts/*": "./artifacts/*"`; files += `"artifacts"`)

**Interfaces:**
- Consumes: tokens de Task 6; molde del header de `primitives/milpa-primitives.css`; componentes existentes (`mui-tabs`, `mui-table`, `mui-modal`, `mui-kbd`, `mui-tooltip`, `mui-badge`, `mui-avatar`).
- Produces: clases raíz `mui-code`, `mui-terminal`, `mui-code-group`, `mui-chart`, `mui-quote`, `mui-callout`, `mui-api`, `mui-steps`, `mui-file-tree`, `mui-prose`, `mui-toc`, `mui-search` (los proofs F3/F5 y `mui-docs` las consumen).

**Organización del Workflow (patrón T2 probado):** 5 clusters build → verify adversarial (ratios computados + token-purity + ARIA + reduced-motion) → fix → re-verify → ensamblado determinista en un solo Write + header del archivo con la nota de capa. Clusters: (a) code+terminal+code-group, (b) chart, (c) quote+callout+steps+file-tree, (d) prose+toc, (e) api+search.

**Spec por pieza** (cada una: contrato completo con `name/layer:"artifact"/version:"0.2.0"/class/summary/element/anatomy/variants/states/tokens/a11y(.behavior)/motion/examples`):

| Pieza | Anatomía (elementos BEM) | Estados/variantes | Notas duras |
|---|---|---|---|
| `mui-code` | `__header` (filename `__file`, badge de lang `__lang`, slot `__actions`), `__body > pre > code`, `__line`, `__ln` (número) | `--numbered`; `__line--highlight` (fondo `--accent-subtle`), `__line--add` / `__line--remove` (tinte `--success-bg`/`--danger-bg` + glifo `+`/`−` en `--success`/`--danger`) | fondo `--syntax-bg`, texto `--syntax-text`; clases de token de highlight: `.tok-kw`,`.tok-str`,`.tok-com`,`.tok-fn`,`.tok-num`,`.tok-punc`,`.tok-var`,`.tok-tag`,`.tok-attr` → mapean 1:1 a `--syntax-*`; `overflow-x:auto` en `__body`; `tab-size:2` |
| `mui-terminal` | `__bar` (dots decorativos `aria-hidden`), `__body`, `__line`, `__prompt` (`$`/`coa`, `user-select:none`), `__out` | `[aria-busy="true"]` → cursor `▍` parpadeante (`@keyframes` con `--dur-deliberate`; reduced-motion → cursor estático visible), `__line--error` (texto `--danger`) | fondo `--syntax-bg`; prompt `--secondary-text`; output `--syntax-text` |
| `mui-code-group` | compone `mui-tabs` + páneles con `mui-code` | tabs por `[aria-selected]` (ya resuelto en mui-tabs) | contrato documenta el patrón ARIA tabs/tabpanel; CSS solo ajusta el seam (tab pegada al bloque, sin doble borde) |
| `mui-chart` | `__title`, `__canvas`, `__bar` (fill por `--_v` inline), `__legend` + `__swatch`, `__axis`, `__tick`, `__grid` | `--bars`, `--bars-h`, `--line` (estilos para `<svg>` embebido: `.mui-chart__stroke-N { stroke: var(--viz-N) }`, `__area-N` fill al 20% vía `color-mix`), `--donut` (conic-gradient con `--_p1..pN`), `--sparkline` | SOLO `--viz-*` para series; grid/ejes con `--border-subtle`/`--text-muted`; los datos los inyecta el consumidor (inline vars / SVG); `a11y.behavior`: el consumidor provee tabla accesible alternativa o `aria-label` con resumen |
| `mui-quote` | `blockquote.mui-quote`, `__mark` (comilla decorativa `--accent`, `aria-hidden`), `__text`, `__attr` (compone `mui-avatar` + `__name` + `__role`) | `--pull` (destacada: borde-inline-start `--accent`, texto `--text-lg`) | citar con `<cite>` en `__name` |
| `mui-callout` | `__icon`, `__title`, `__body` (prosa) | `--note` (info), `--tip` (secondary/olivo), `--warning`, `--danger`, `--version` (accent; para "Added in v0.2.0") | tintes `--*-bg` + borde `--*-border` + título en el semántico — pares ya verificados; `role="note"`; NO es `mui-alert` (sin acciones, anatomía de documento) |
| `mui-api` | `__signature` (bloque `--syntax-bg` con `.tok-*`), `__meta` (badges de estabilidad), `__params` (usa `mui-table`), `__returns`, `__throws` | badges: reusa `mui-badge--since/--deprecated/--experimental` (Task 8) | contrato documenta el mapeo docblock→anatomía (`@param`→fila de `__params`, `@since`→badge, `@deprecated`→badge + `__deprecated-note`) |
| `mui-steps` | `ol.mui-steps > li.mui-steps__item`, `__marker` (número, círculo `--surface-raised` + borde), `__title`, `__body` | `[aria-current="step"]` → marker fill `--accent-subtle` + borde `--accent`; `--done` vía `[data-state="done"]`… **NO**: usar `[aria-current]` + orden del DOM; item pasado = hermano anterior (`li:has(~ [aria-current])` marker en `--success`) | conector vertical `--border-subtle`; doble uso: guías de docs y checkout |
| `mui-file-tree` | `ul[role="tree"].mui-file-tree`, `__item`, `__dir` (usa `<details>/<summary>` nativo), `__file`, `__badge` (anotación "new"/"gen") | `[aria-current="true"]` en archivo activo → `--accent-subtle` + `--accent-text` | glifos de carpeta/archivo en CSS (`::before` con `content`), indentación por nivel con `--space-*` |
| `mui-prose` | scope: `.mui-prose` estiliza descendientes h1–h6, p, ul/ol, li, a, strong, em, code inline, pre>code (delega a tokens de sintaxis), blockquote, table, hr, img, figure/figcaption | — | máx `65ch`; links `--accent-text` con underline (siempre, no solo hover); `h2` con borde inferior `--border-subtle`; code inline con fondo `--surface` + borde `--border-subtle`; headings con `scroll-margin-top` para anchors |
| `mui-toc` | `nav.mui-toc` (+`aria-label="On this page"`), `__title`, `__list`, `__item` (indent por nivel), `__link` | `[aria-current="location"]` → `--accent-text` + barra-grano inline-start (patrón del sidebar admin) | sticky (`top: var(--space-8)`); `a11y.behavior`: scroll-spy setea `aria-current` |
| `mui-search` | `button.mui-search-trigger` (parece input: icono + "Search docs…" + `mui-kbd` ⌘K) + `dialog.mui-search` (compone `mui-modal`: `__input`, `__results` con patrón listbox, `__result` con `__crumb` + `__excerpt`, `__empty` reusa mui-empty) | `__result[aria-selected="true"]` → `--accent-subtle` | `a11y.behavior`: combobox/listbox ARIA + atajos documentados; el índice de búsqueda es del framework |

**Skeleton de referencia para los clusters** (el molde aplicado a un artefacto — mui-code, extracto normativo):

```css
/* ===== Code — el artefacto de código (docs, blog, api) ===== */
.mui-code {
  background: var(--syntax-bg); color: var(--syntax-text);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-lg);
  font-family: var(--font-mono); font-size: var(--text-sm); line-height: var(--leading-relaxed);
}
.mui-code__header {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-block-end: 1px solid var(--border-subtle); color: var(--text-secondary);
}
.mui-code__body { overflow-x: auto; padding: var(--space-4); tab-size: 2; }
.mui-code__body pre { margin: 0; }
.tok-kw { color: var(--syntax-keyword); }
.tok-str { color: var(--syntax-string); }
.tok-com { color: var(--syntax-comment); font-style: italic; }
/* …resto de .tok-* → --syntax-* … */
```

- [ ] **Step 1:** Lanzar el Workflow (5 clusters build con las tablas de arriba como contrato de entrada + molde del header de primitives + skeleton; cada cluster devuelve `{css, contracts[]}` por StructuredOutput).
- [ ] **Step 2:** Verify adversarial por cluster: ratios reales computados con node contra `tokens/milpa-tokens.json` para CADA par fg/bg que el CSS use (ambos temas), token-purity, estados solo por atributos, reduced-motion (todo `@keyframes`/`transition` neutralizado o equivalente estático), llaves balanceadas. Fix → re-verify hasta 0 majors.
- [ ] **Step 3:** Ensamblado determinista: un solo Write de `artifacts/milpa-artifacts.css` — header con molde + nota de capa, `LAYER_ORDER` primera línea de código, todo dentro de `@layer milpa.artifacts { }`, orden: code → terminal → code-group → chart → quote → callout → api → steps → file-tree → prose → toc → search. Escribir los 12 contratos.
- [ ] **Step 4:** Actualizar `scripts/verify-governance.mjs` (CSS_FILES, CONTRACT_DIRS, LAYERED) y `package.json` (exports/files) como se lista arriba.
- [ ] **Step 5:** Run `npm test` → Expected: 191 AA + governance ALL PASS (ahora escaneando artifacts/, 44 contratos).
- [ ] **Step 6:** Commit: `git add artifacts/ scripts/verify-governance.mjs package.json && git commit artifacts/ scripts/verify-governance.mjs package.json -m "feat(artifacts): el elote — 12 artefactos de contenido con contrato (code, terminal, chart, prose…)"`

---

# FASE 3 · Docs: shell + kit de versionado + proof

### Task 8: Kit de versionado (artifacts) + variantes de badge

**Files:**
- Modify: `artifacts/milpa-artifacts.css` (agregar sección "versioning" al final, dentro de la capa)
- Create: `artifacts/milpa-{version-switcher,version-banner,changelog}.contract.json`
- Modify: `primitives/milpa-primitives.css` (variantes de badge) + `primitives/milpa-badge.contract.json` (bump `version`, nuevas variantes)

**Interfaces:**
- Consumes: `mui-menu` (switcher), `mui-badge` (base), tokens semánticos existentes.
- Produces: `mui-version-switcher`, `mui-version-banner`, `mui-changelog`, `mui-badge--since|--deprecated|--experimental` (los consumen `mui-docs`, `mui-api`, `proof/docs.html`).

**Spec:**

| Pieza | Anatomía | Reglas |
|---|---|---|
| `mui-version-switcher` | `button.mui-version-switcher` (label "v0.2.0" mono + chevron) + panel `mui-menu` con `__item` por versión | ítem activo `[aria-current="true"]` → check + `--accent-text`; ítem "latest" lleva `mui-badge--accent`; `a11y.behavior`: patrón menu-button, navega a `/docs/{version}/{page}` conservando page |
| `mui-version-banner` | `div[role="status"].mui-version-banner` — icono, texto ("You're viewing docs for **v0.1.0** — latest is **v0.3.0**"), link `__link` a latest | tinte `--warning-bg` + borde `--warning-border` + título `--warning`, cuerpo `--text` (pares verificados); full-width arriba del artículo; NO dismissible (es un hecho, no un aviso) |
| `mui-changelog` | `section.mui-changelog > __release` (por versión: `__version` heading mono + `__date` + `__badges`) > `__group` (por tipo) > `__item` | tipos → badges existentes: added=`--success`, changed=`--info`, fixed=`--secondary`, removed/breaking=`--danger` (glifo + texto, no solo color); cada `__item` es prosa (`mui-prose` compatible) |
| `mui-badge--since` | texto "Since v0.2.0" | tinte `--secondary-subtle` + `--secondary-text` (par verificado) |
| `mui-badge--deprecated` | "Deprecated" (+opcional versión) | `--danger` sobre `--danger-bg` (verificado); SIEMPRE acompañado de texto/nota, no solo color |
| `mui-badge--experimental` | "Experimental" | `--warning` sobre `--warning-bg` (verificado) |

- [ ] **Step 1:** Autoría (cluster único con verify, mismo pipeline) → append determinista a `artifacts/milpa-artifacts.css` (antes del cierre de capa) + variantes badge en primitives + 3 contratos nuevos + bump del contrato de badge (version minor, changelog interno del contrato en `summary`).
- [ ] **Step 2:** Run `npm test` → verde (47 contratos).
- [ ] **Step 3:** Commit: `git add artifacts/ primitives/ && git commit artifacts/ primitives/ -m "feat(artifacts): kit de versionado — switcher, banner, changelog, badges de estabilidad"`

### Task 9: `layouts/` nace con `mui-docs`

**Files:**
- Create: `layouts/milpa-layouts.css` + `layouts/milpa-docs.contract.json`
- Modify: `scripts/verify-governance.mjs` (CSS_FILES += `'layouts/milpa-layouts.css'`; CONTRACT_DIRS += `'layouts'`; LAYERED += `'layouts/milpa-layouts.css': 'milpa.layouts'`)
- Modify: `package.json` (exports `"./layouts.css": "./layouts/milpa-layouts.css"`, `"./layouts/*": "./layouts/*"`; files += `"layouts"`)

**Interfaces:**
- Consumes: `mui-version-switcher/banner`, `mui-search-trigger`, `mui-toc`, `mui-prose`, `mui-breadcrumbs`, patrones responsive del `mui-shell` admin.
- Produces: `mui-docs` con: `__topbar`, `__nav` (sidebar izq: `__nav-group` con heading, `__nav-item` con `[aria-current="page"]` → barra-grano), `__main` (artículo, contiene `mui-version-banner` + `mui-prose` + `__pager`), `__aside` (contiene `mui-toc`), `__pager` (`__prev`/`__next` como cards), `--rail` colapsado.

**Spec duro:** grid 3 columnas `minmax(15rem,17rem) minmax(0,1fr) minmax(13rem,15rem)`; `__nav` y `__aside` sticky con scroll propio; breakpoints: <1100px se cae `__aside` (el TOC puede renderizarse como `<details>` arriba del artículo — clase `mui-toc--inline`), <880px `__nav` off-canvas (mismo mecanismo del shell admin: `[data-open]` en el contenedor + scrim, documentado en `a11y.behavior`); slots del `__topbar`: brand, `mui-search-trigger`, `mui-version-switcher`, toggle de tema, GitHub. Convención de URL en el contrato: `a11y.behavior.routing = "/docs/{version}/{page} — el routing lo implementa el framework; el switcher preserva {page} al cambiar {version}"`.

- [ ] **Step 1:** Autoría (cluster + verify adversarial: contraste computado de todo par nuevo, sticky/overflow sano, focus visible en nav items) → Write de `layouts/milpa-layouts.css` (header molde + `LAYER_ORDER` + `@layer milpa.layouts { }`) + contrato.
- [ ] **Step 2:** Governance + package.json como arriba. Run `npm test` → verde (48 contratos).
- [ ] **Step 3:** Commit: `git add layouts/ scripts/verify-governance.mjs package.json && git commit layouts/ scripts/verify-governance.mjs package.json -m "feat(layouts): la parcela nace — mui-docs, el shell de documentación versionada"`

### Task 10: `proof/docs.html` — el sitio de docs completo

**Files:**
- Create: `proof/docs.html` (~600–800 líneas; TODO el contenido dummy en inglés)

**Interfaces:**
- Consumes: TODO lo anterior. Es el battle-test integral de F2+F3.

**Contenido obligatorio (una página de docs de Milpa framework creíble):** topbar completo (brand con wordmark del kit — snippet oficial de `logo/README.txt` —, search trigger, switcher mostrando "v0.1.0" con menú v0.2.0/v0.1.0/v0.0.x, toggle de tema); `mui-version-banner` (estamos viendo v0.1.0, latest v0.2.0); nav con 3 grupos (Getting started / Core concepts / API); artículo "Module contracts" en `mui-prose` que embeba: `mui-callout--version` ("Added in v0.2.0"), `mui-code` PHP con `.tok-*` reales y línea highlight, `mui-code-group` (PHP/CLI/JSON), `mui-terminal` (`$ coa siembra mail-module` — el comando queda en español, es marca), `mui-callout--warning`, `mui-api` de un método con badge `--since` y un `@param` deprecated, `mui-steps` de 4 pasos, `mui-file-tree` del esqueleto de un módulo, `mui-chart--bars` ("Contract checks per release") con leyenda; TOC activo con `aria-current`; pager prev/next; página secundaria simulada: sección Changelog con `mui-changelog` (v0.2.0 added/changed + v0.1.0). JS inline permitido SOLO para: toggle de tema (patrón del landing), abrir/cerrar off-canvas, y scroll-spy demo del TOC.

- [ ] **Step 1:** Autoría del proof (agente con el inventario de arriba como checklist).
- [ ] **Step 2:** Verificación visual con chrome-devtools: dark, light, 1280px, <1100px (TOC inline), 420px (off-canvas), consola limpia, tab-order sano, `:focus-visible` visible en nav/switcher/código.
- [ ] **Step 3:** Run `npm test` → verde. Commit: `git add proof/docs.html && git commit proof/docs.html -m "feat(proof): docs site completo — versionado, artefactos y mui-docs battle-tested"`

---

# FASE 4 · La parcela: vocabulario de página + media + commerce

### Task 11: Vocabulario de página (marketing) en `layouts/`

**Files:**
- Modify: `layouts/milpa-layouts.css` (append dentro de la capa)
- Create: `layouts/milpa-{page,hero,feature-grid,pricing,faq,testimonial,cta-band,footer}.contract.json`

**Interfaces:**
- Consumes: primitivas/componentes existentes + `mui-quote` (testimonial).
- Produces: `mui-page` (+`mui-section`, `mui-container` en el MISMO contrato "page"), `mui-hero`, `mui-feature-grid`, `mui-pricing`, `mui-faq`, `mui-testimonial`, `mui-cta-band`, `mui-footer` — los consumen los proofs F5 y la landing F6.

**Spec:**

| Pieza | Anatomía / reglas |
|---|---|
| `mui-page` / `mui-section` / `mui-container` | formalizan `ld-*` de la landing: container `max-width:72rem` + padding fluido `clamp(var(--space-5),4vw,var(--space-8))`; section `padding-block: clamp(var(--space-16),10vw,var(--space-24))`; `mui-section+mui-section` borde `--border-subtle`; variantes `--tight`, `--wide` |
| `mui-hero` | `__kicker` (mono uppercase `--secondary-text`), `__title` (clamp 2xl→5xl, `--tracking-display`), `__tagline`, `__sub` (máx 46ch `--text-muted`), `__cta` (fila de botones), `__meta` (badges), `__media` (columna secundaria); grid 1.15fr/0.85fr, colapsa <880px |
| `mui-feature-grid` | grid auto-fit `minmax(16rem,1fr)`; `__item` = card sutil: `__icon` (2.25rem, `--secondary-text`; variante `--oro`), `__title`, `__body` |
| `mui-pricing` | grid de `__plan` (card); `__name`, `__price` (display `--text-4xl` + `__period` muted), `__features` (lista con check `--success`), `__cta`; plan destacado `[data-featured]` → borde `--accent` + badge "Recommended" (auto-borde N/A: es outline) |
| `mui-faq` | `__item` = `<details>` nativo: `summary.__q` (con chevron rotante `--dur-fast`; reduced-motion sin rotación), `__a` en prosa; separadores `--border-subtle`; `summary` con `:focus-visible` |
| `mui-testimonial` | compone `mui-quote --pull` + grid de 2–3 por fila |
| `mui-cta-band` | sección de cierre centrada: `__title`, `__actions`; fondo `--surface` + borde |
| `mui-footer` | mega footer: `__brand` (wordmark + mantra), `__cols` (grid de `__col` con `__heading` mono + links `--text-muted`→`--text` hover), `__legal` (fila inferior con licencia) |

- [ ] **Step 1:** Autoría (2 clusters: page+hero+feature+cta / pricing+faq+testimonial+footer) + verify adversarial → append determinista + 8 contratos.
- [ ] **Step 2:** Run `npm test` → verde (56 contratos). Commit: `git add layouts/ && git commit layouts/ -m "feat(layouts): vocabulario de página — hero, features, pricing, faq, footer…"`

### Task 12: Media — `mui-media-grid` + `mui-lightbox`

**Files:**
- Modify: `layouts/milpa-layouts.css` (append)
- Create: `layouts/milpa-{media-grid,lightbox}.contract.json`

**Spec:** `mui-media-grid`: grid uniforme (aspect-ratio en `__item`) y variante `--masonry` (CSS columns; `__item` con `break-inside:avoid`); `__item` es `<a>` o `<button>` con `figure` + `__caption` overlay en gradiente… **sin gradiente hardcodeado**: overlay con `color-mix(in srgb, var(--bg) 78%, transparent)`; hover: caption visible + zoom sutil `--dur-moderate` (reduced-motion: caption siempre visible, sin zoom); `:focus-visible` visible. `mui-lightbox`: shell sobre `<dialog>` (patrón de `mui-modal`): `__media` (max 90vmin), `__caption`, `__nav` (`__prev`/`__next` botones icon), `__close`, `__counter` ("3 / 12" mono); `a11y.behavior`: focus trap del dialog nativo, flechas de teclado, `aria-label` por imagen.

- [ ] **Step 1:** Autoría (cluster + verify) → append + 2 contratos.
- [ ] **Step 2:** `npm test` verde (58 contratos). Commit: `git add layouts/ && git commit layouts/ -m "feat(layouts): media-grid (uniforme/masonry) + lightbox sobre dialog nativo"`

### Task 13: Componentes de dominio commerce (en `components/`)

**Files:**
- Modify: `components/milpa-components.css` (append antes del cierre de capa)
- Create: `components/milpa-{product-card,price,rating,media-gallery,cart-line}.contract.json`

**Interfaces:**
- Produces: `mui-product-card`, `mui-price`, `mui-rating`, `mui-media-gallery`, `mui-cart-line` (los consume `proof/commerce.html`).

**Spec:**

| Pieza | Anatomía / reglas |
|---|---|
| `mui-product-card` | extiende el patrón card interactiva: `__media` (aspect-ratio 4/5, `img` object-cover), `__body` (`__title`, `__meta` muted, `mui-price`), `__badge` (esquina: "New"=`--info`, "Sale"=`--danger`, "Low stock"=`--warning` — badges existentes posicionados), `__actions` (aparece en hover en desktop, siempre visible touch/reduced-motion); `[aria-disabled="true"]` = out of stock (media al 50% + badge) |
| `mui-price` | `__amount` (mono `--weight-bold`), `__currency`, `__compare` (precio anterior: tachado `--text-muted` + `aria-label` "was $X"), `__unit`; variante `--lg` para PDP |
| `mui-rating` | patrón presentacional: 5 glifos estrella CSS (`__star`, fill `--accent`, vacío `--border-strong` — 3:1 ✓), `__value` mono, `__count` muted link; `role="img"` + `aria-label="4.2 out of 5, 128 reviews"`; NUNCA solo color |
| `mui-media-gallery` | PDP: `__main` (imagen activa, aspect 1/1) + `__thumbs` (fila de `button.__thumb`, activa `[aria-current="true"]` → borde `--accent`); `a11y.behavior`: flechas + thumbs como tablist opcional |
| `mui-cart-line` | fila: `__media` (thumb 4rem), `__info` (`__title` + `__variant` muted), `__qty` (input-group existente con botones −/+, `aria-label`), `mui-price`, `__remove` (btn ghost danger icon con `aria-label`); stack <560px |

- [ ] **Step 1:** Autoría (cluster + verify) → append determinista + 5 contratos.
- [ ] **Step 2:** `npm test` verde (63 contratos). Commit: `git add components/ && git commit components/ -m "feat(components): dominio commerce — product-card, price, rating, gallery, cart-line"`

---

# FASE 5 · Proofs de casos de uso + validador de themes

### Task 14: `proof/blog.html`

Listado + artículo en una página (dos "vistas" apiladas con anchor nav): hero editorial (`mui-hero` variante contenido), grid de posts (`mui-feature-grid` adaptado con cards de post: imagen, tag badges, fecha mono, excerpt), y el artículo completo en `mui-prose` con `mui-quote --pull`, `mui-code`, imágenes con figcaption, bio de autor (`mui-avatar` + texto), posts relacionados, `mui-footer`. Todo inglés.
- [ ] Autoría + verificación visual (dark/light/420px/consola) + `npm test` + commit `git add proof/blog.html && git commit proof/blog.html -m "feat(proof): blog/editorial"`

### Task 15: `proof/commerce.html`

Storefront: topbar con búsqueda + carrito con badge contador; grid de `mui-product-card` (8 productos, uno out-of-stock, uno on-sale); PDP: `mui-media-gallery` + `mui-price --lg` + `mui-rating` + variantes (radios `mui-choice`) + qty + CTA primary; carrito como `mui-drawer` con `mui-cart-line` × 3 + resumen + `mui-steps` de checkout (paso 2 current). Estados vacíos con `mui-empty`.
- [ ] Autoría + verificación visual + `npm test` + commit `git add proof/commerce.html && git commit proof/commerce.html -m "feat(proof): ecommerce"`

### Task 16: `proof/gallery.html`

Portfolio: hero mínimo, `mui-media-grid --masonry` (12 piezas, alturas variadas — SVGs/placeholders generados inline, sin assets externos), filtros por tag (`mui-tabs` variante pills), `mui-lightbox` funcional (JS inline mínimo: abrir dialog, prev/next), página de pieza con `mui-prose` + metadata.
- [ ] Autoría + verificación visual (incluye abrir lightbox con teclado) + `npm test` + commit `git add proof/gallery.html && git commit proof/gallery.html -m "feat(proof): gallery/portfolio"`

### Task 17: `proof/saas.html`

Landing de producto SaaS ficticio ("Troje — backups for Milpa apps"): `mui-hero` con screenshot simulado (un `mui-card` con `mui-stat`s), logos sociales, `mui-feature-grid`, `mui-chart --line` de métricas, `mui-pricing` (3 planes, medio destacado), `mui-testimonial` × 3, `mui-faq` × 6, `mui-cta-band`, `mui-footer`.
- [ ] Autoría + verificación visual + `npm test` + commit `git add proof/saas.html && git commit proof/saas.html -m "feat(proof): saas landing"`

### Task 18: `scripts/verify-theme.mjs` — el validador de referencia

**Files:**
- Create: `scripts/verify-theme.mjs`
- Modify: `package.json` (script `"verify:theme": "node scripts/verify-theme.mjs"`)

**Interfaces:**
- Consumes: `theme.contract.json` (pares + requiredTokens + invariants).
- Produces: CLI `node scripts/verify-theme.mjs <archivo.css>` — parsea del CSS del theme los bloques `:root`/`[data-theme="dark"]`/`[data-theme="light"]` con valores **hex planos** (`--token:#RRGGBB`), resuelve cada tema (light hereda de :root lo no redefinido), y valida: (1) presencia de `requiredTokens.color`, (2) TODOS los `contrast.pairs` con las mismas fórmulas WCAG de `verify-contrast.mjs` (copiar las 4 funciones `hx/lin/Y/CR` — son 4 líneas, mantener cero dependencias), (3) imprime PASS/FAIL por par y sale 1 si falla. Limitación documentada en el header: solo hex planos (la referencia para `coa`; no resuelve `var()` anidadas).

- [ ] **Step 1:** Escribir el script (~90 líneas). Probar contra un theme válido mínimo y uno roto (en scratchpad) → PASS y FAIL respectivamente.
- [ ] **Step 2:** Actualizar THEMING.md §6 con el uso real. Commit: `git add scripts/verify-theme.mjs package.json THEMING.md && git commit scripts/verify-theme.mjs package.json THEMING.md -m "feat(theming): verify-theme.mjs — validador de referencia contra theme.contract.json"`

### Task 19: `proof/themed.html` — la prueba del contrato

El MISMO contenido del blog (Task 14) con un skin de plugin "Nopal" inyectado en un `<style>` sin layer: **L1** — override de ~20 tokens (paleta propia basada en verdes/rosas de nopal+tuna: valores hex directos elegidos para pasar los pares; radius más redondo `--radius-*`, otra fuente display via `@font-face` del sistema o stack alternativo); **L2** — reskin de `.mui-btn--primary` (fill sólido con su propio acento, auto-borde respetado) y de `.mui-card` (sombra/borde distintos). El skin vive también en `proof/themed-skin.css` (mismo contenido, para poder validarlo).
- [ ] **Step 1:** Elegir la paleta del skin computando los pares con `verify-theme.mjs` ANTES de escribir el HTML: `npm run verify:theme -- proof/themed-skin.css` → ALL PASS (iterar valores hasta verde).
- [ ] **Step 2:** Autoría del proof (copia del blog + skin + banner explicativo arriba: "Same components, different soul — this is a plugin skin passing the same AA gate").
- [ ] **Step 3:** Verificación visual dark/light + `npm test` + commit `git add proof/themed.html proof/themed-skin.css && git commit proof/themed.html proof/themed-skin.css -m "feat(proof): themed — un skin de plugin pasa el gate sin tocar los bundles"`

---

# FASE 6 · Landing EN + release 0.2.0

### Task 20: Landing a inglés + vocabulario `mui-*`

**Files:**
- Modify: `landing/index.html`

**Reglas de traducción:** todo el copy a inglés EXCEPTO: el tagline `Siembra módulos, cosecha aplicaciones.` (verbatim, es el mantra), el comando `coa siembra mail-module`, y los nombres propios (Milpa, Grano, las tres hermanas se traducen explicando: "The three sisters — corn, beans, and squash"). `<html lang="en">`. Títulos/meta/og en inglés.

**Migración:** reemplazar `ld-container/ld-section/ld-h2/ld-lede/ld-kicker` por `mui-container/mui-section/mui-hero__*` + clases del vocabulario nuevo; el CSS `ld-*` restante (granoM, hint, install, code demo) se queda como CSS propio del proof (es contenido, no sistema). Header gana link "Docs" (href `/docs`, y en el proof local apunta a `../proof/docs.html`). Conservar INTACTO el momento firma (GSAP scatter→M), el toggle de tema y data-copy.
- [ ] **Step 1:** Migrar + traducir. **Step 2:** Verificación visual completa (dark/light/mobile/scroll signature/reduced-motion emulado) + consola limpia. **Step 3:** `npm test` verde. Commit: `git add landing/index.html && git commit landing/index.html -m "feat(landing): English copy (Spanish mantra kept) + migrated to mui layout vocabulary"` — este commit ABSORBE el staged previo de otra sesión (mismo archivo); avisar a Rod en el reporte.

### Task 21: Documentación del repo + bump + release

**Files:**
- Modify: `package.json` (version `0.2.0`), `CHANGELOG.md`, `README.md`, `HANDOFF.md`, `DESIGN.md` (apéndice file-map + regla de capas en §6)

- [ ] **Step 1:** `CHANGELOG.md` — entrada `[0.2.0]`: Added (artifacts 15 piezas, layouts 11, commerce 5, kit versionado, tokens syntax/viz, theme.contract.json + THEMING.md + verify-theme, 6 proofs, exports nuevos), Changed (todo el CSS en `@layer` — nota de compat: los overrides sin layer ahora SIEMPRE ganan; PAIRS externalizados; landing EN), contadores del gate (191+ checks, 63 contratos).
- [ ] **Step 2:** README — Estado v0.2, árbol de estructura con artifacts/layouts/THEMING, sección "Theming" de 6 líneas con los 3 niveles. HANDOFF — §2 estado nuevo, backlog: marcar lo hecho, dejar T5 y "coa valida themes" como próximos. DESIGN — apéndice + regla: "todo CSS publicado declara su @layer; los tokens nuevos syntax/viz son semánticos de la paleta cerrada".
- [ ] **Step 3:** `npm test` verde final + `npm run release:dry` → revisar files list (debe incluir artifacts/, layouts/, theme.contract.json, THEMING.md). Commit: `git add package.json CHANGELOG.md README.md HANDOFF.md DESIGN.md && git commit package.json CHANGELOG.md README.md HANDOFF.md DESIGN.md -m "chore(release): @milpa/design 0.2.0 — artefactos, layouts, docs versionadas y theming inyectable"`
- [ ] **Step 4:** **Publicar solo con confirmación de Rod** (`npm run release` — puede pedir `--otp`).

---

## Matriz de verificación final (criterios del spec §12)

- [ ] `npm test`: ~191+ pares AA + governance (con regla @layer, 63 contratos) + drift (dist × 2 + theme.contract.json) — todo verde.
- [ ] 6 proofs verificados visualmente: dark, light, mobile (420px), teclado, consola limpia.
- [ ] `proof/themed.html`: swap completo sin tocar bundles publicados; `verify:theme` ALL PASS sobre `themed-skin.css`.
- [ ] Un autor de plugin puede leer THEMING.md + theme.contract.json y saber qué proveer sin leer CSS interno.
- [ ] Todo componente nuevo tiene contrato (`layer: "artifact"` o `"layout"`); governance los valida.
