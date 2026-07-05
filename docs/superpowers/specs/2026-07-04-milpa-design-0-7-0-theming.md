# Milpa Design 0.7.0 — "la piel" (theming release-grade)

- **Fecha:** 2026-07-04
- **Estado:** aprobado (brainstorming) → pendiente de plan de implementación
- **Versión objetivo:** `@milpa/design@0.7.0` (minor — aditivo, sin ruptura: todos los tokens nuevos defaultean a su valor actual y `--font-display` queda como alias)
- **Motivación:** la auditoría de personalización (32 hallazgos) mostró que el theming es release-grade para color/spacing/radios/motion/dark-light, pero NO para tipografía y marca serias: un solo `--font-display` gobierna títulos y cuerpo, las fuentes no se cargan solas, el contrato declara 7 grupos pero `verify-theme` solo gatea color, y dimensiones definitorias (focus-ring, container, drawer/sidebar, bordes, aspect-ratio, measure) están hardcodeadas fuera del alcance de un skin.

## 1. Principio de seguridad (invariante de todo el release)

**Cada token nuevo defaultea EXACTAMENTE a su valor hardcodeado actual.** Por lo tanto el build por
defecto es **pixel-idéntico** — cero cambio visual. Lo único que cambia es que ahora existe superficie
para overridear vía skin. La verificación central es un **diff de `getComputedStyle`** en los 6 proofs
(dark+light) que debe dar **cero** diferencias por defecto. `--font-display` sobrevive como alias, así
que ningún consumidor existente se rompe.

## 2. Alcance

**Parte A — Tipografía + honestidad del gate:**
- A1. Split 2-tier `--font-heading` / `--font-body` (+ `--font-display` alias); repuntar todo el bundle.
- A2. `--font-serif` opcional (prose/quotes).
- A3. `--weight-semibold: 600`.
- A4. Documentar la carga de fuentes (THEMING.md) — **solo doc**, sin enviar archivos de fuente.
- A5. `verify-theme` valida los 7 grupos por FORMA (tipo + no-vacío) para cualquier token que el skin
  setee; el contrato deja de sobre-declarar (distinción hard-gate vs form-gate).

**Parte B — Dimensiones estructurales → tokens públicos (todos default = valor actual):**
- B1. Focus-ring: `--focus-width` (2px) + `--focus-offset` (2px).
- B2. `--border-width` (1px).
- B3. Container: `--container-max` (72rem) / `--container-narrow` (48rem) / `--container-wide` (90rem).
- B4. App-shell: `--header-h` (3.5rem), `--sidebar-w` (16rem), `--drawer-width` (26rem).
- B5. Aspect-ratio (`--media-ratio` reusado) + `--measure` (65ch).

**Fuera de alcance (documentar como límites conocidos, futuro):** 3er eje de tema (high-contrast /
brand-alt / forced-colors — hoy vedado por invariante #3), single-source de breakpoints (`@custom-media`
/ `@container`), eje de densidad, RTL como contrato. Son concerns arquitectónicos aparte.

## 3. Reglas de la casa que se honran

- Los tokens se definen en la FUENTE `tokens/milpa-tokens.json` → `npm run build` (build-tokens.mjs)
  regenera `dist/milpa-tokens.css` + `dist/tailwind.config.js`; `npm test` corre `build-tokens --check`
  (gate de drift). NUNCA editar `dist/` a mano.
- Todo el CSS en su `@layer`; paleta cerrada (los tokens nuevos NO son colores); estado ARIA/nativo.
- Cambio aditivo → minor `0.7.0`. El conteo de piezas con contrato sigue **68** (esto es tokens + gate,
  no piezas nuevas).
- AA / light-dark / reduced-motion / teclado intactos (el diff de computed styles = 0 lo garantiza).

## 4. Parte A — Tipografía

### 4.1 Split heading/body (A1)

Hoy `--font-display` ('Space Grotesk', system-ui, sans-serif) se usa en TODO el texto no-mono. Se parte:

```
--font-heading: 'Space Grotesk', system-ui, sans-serif;   /* default = stack actual */
--font-body:    'Space Grotesk', system-ui, sans-serif;   /* default = stack actual */
--font-display: var(--font-heading);                       /* alias back-compat */
```

**Clasificación de selectores** (el plan enumera CADA ocurrencia de `var(--font-display)` — hay ~decenas
— y la mapea a uno de los dos):
- **`--font-heading`** = texto de rol display/título: encabezados `h1..h6` (la regla base de headings),
  los `.mui-*__title` (card/drawer/modal/dialog/etc.), valores hero/stat display, wordmark de texto.
- **`--font-body`** = todo el resto que hoy es `--font-display`: `.mui-prose` (cuerpo), párrafos,
  `.mui-*__body`, labels, botones, inputs, badges, nav, tabs, tabla, breadcrumbs, tooltips, etc. (el
  chrome de UI usa la fuente de cuerpo, no la de títulos — convención estándar).
- `--font-mono` no se toca.

Como ambos defaultean al mismo stack, el render por defecto no cambia; un consumidor que setee
`--font-body: 'Inter'` obtiene Inter en cuerpo+UI y Space Grotesk en títulos.

### 4.2 `--font-serif` (A2)

```
--font-serif: var(--font-body);   /* default: hereda body → cero cambio hasta que el consumidor lo ponga */
```
`.mui-prose`, `.mui-quote` y `blockquote` pasan a leer `font-family: var(--font-serif)` directamente.
Como `--font-serif` defaultea a `var(--font-body)`, por defecto esos elementos siguen exactamente en la
fuente de cuerpo (cero cambio visual). Un consumidor que setee `--font-serif: 'Georgia'` obtiene prose y
quotes en serif **sin** tocar el resto del cuerpo/UI. (Decisión: el default hereda body, NO un serif de
sistema, para no cambiar el look por defecto.)

### 4.3 `--weight-semibold` (A3)

Agregar al bloque de type: `--weight-semibold: 600;` (escala 400/500/**600**/700). No se aplica a ningún
selector por defecto (nadie hardcodea 600 hoy — es superficie nueva para el consumidor y para futuros
componentes).

### 4.4 Carga de fuentes (A4) — solo doc

Sección nueva en `THEMING.md`: cómo cargar las fuentes (snippet self-host `@font-face` para Space
Grotesk/Space Mono + alternativa `<link>` a un servicio), y nota explícita de que **la degradación a
`system-ui` es intencional** (el paquete no carga fuentes ni depende de un CDN). NO se envía `fonts.css`
ni archivos de fuente (no atar el paquete a assets binarios / a un CDN).

### 4.5 Mirror de Tailwind

`dist/tailwind.config.js` (generado) refleja `fontFamily`: `heading`/`body`/`serif`/`mono` (+ `display`
como alias de heading), en vez de solo display/mono. Sale del build.

## 5. Parte A — Honestidad del gate (A5)

### 5.1 `verify-theme` valida los 7 grupos por forma

Hoy `scripts/verify-theme.mjs` solo lee `contract.requiredTokens.color` y solo evalúa `contrast.pairs`.
Se extiende: para CADA token que el skin setea, si pertenece a un grupo conocido del contrato, validar
que su valor tenga la FORMA correcta (regex/type-check ligero), y **fallar (exit 1)** si un token que el
skin declaró está malformado:

| Grupo | Forma esperada |
|---|---|
| type: `--font-*` | string no-vacío (lista de familias) |
| type: `--text-*` / `--tracking-*` | `<length>` (rem/px/em) |
| type: `--leading-*` | número (unitless) |
| type: `--weight-*` | número 1–1000 |
| space / radius / elevation-length | `<length>` (rem/px/ch/0) o `9999px`/`0` |
| zIndex | entero |
| motion: `--dur-*` / `--stagger-*` | `<time>` (ms/s) |
| motion: `--ease-*` | timing-function válida (cubic-bezier/linear/steps) |
| motion: `--rise-*` | `<length>` |
| elevation: `--shadow-*` | valor de box-shadow no-vacío |
| **size (nuevo)**: focus/border/container/shell/measure | `<length>` (o `<ratio>` para aspect) |

Solo valida lo que el skin **presente** (respeta skins parciales — la herencia rellena el resto). El
contraste de color sigue siendo el único gate HARD por umbral; el resto es gate por FORMA.

### 5.2 El contrato deja de mentir

`theme.contract.json` se reestructura para declarar explícito qué se valida y cómo:
- Un campo/convención que distinga **`hard` (contraste de color, con umbral)** de **`form` (los demás
  grupos, validados por tipo)**. Los 6 grupos no-color dejan de ser documentación inerte.
- Se agrega un grupo **`size`** (nuevo) con los tokens de dimensión de la Parte B.
- La prosa del contrato (y THEMING.md §6) aclara: un PASS garantiza contraste AA + formas bien tipadas de
  lo que el skin toca — NO completitud ni magnitudes "de buen gusto".

## 6. Parte B — Dimensiones estructurales → tokens públicos

Todos se definen en el JSON fuente (grupo `size`) con default = valor actual, y se repuntan sus sitios.

### 6.1 Focus-ring (B1)
`--focus-width: 2px;` `--focus-offset: 2px;`. Reemplazar los ~42 `outline: … 2px …` / `outline-offset`
literales por `outline-width: var(--focus-width)` / `outline-offset: var(--focus-offset)` (el color ya es
`var(--focus)`). OJO: algunos offsets son negativos (`-2px`, anillo interno en piezas al borde) — esos
usan `calc(-1 * var(--focus-offset))` para preservar el signo. Solo los anillos de foco; no tocar otros
outlines si los hubiera.

### 6.2 `--border-width` (B2)
`--border-width: 1px;`. Reemplazar los ~86 `border…: 1px …` estructurales por `var(--border-width)`.
**Cuidado quirúrgico:** solo los bordes de 1px que son "lenguaje de borde" del sistema; NO tocar (a) el
grosor del focus-ring (B1, aparte), (b) cualquier borde intencionalmente ≠1px si existe. El plan lista
cada sitio y confirma que es un borde estructural de 1px antes de cambiarlo.

### 6.3 Container (B3)
`--container-max: 72rem;` `--container-narrow: 48rem;` `--container-wide: 90rem;`. Repuntar
`layouts` (~277/282/283) y el shell/topbar (90rem, components ~914).

### 6.4 App-shell (B4)
`--header-h: 3.5rem;` `--sidebar-w: 16rem;` `--drawer-width: 26rem;`. Promover los knobs privados
`--_topbar-h`/`--_sidebar-w` y el 2º arg de `min(92vw, 26rem)` del drawer a estos tokens públicos
(el `min(92vw, var(--drawer-width))` conserva el guard de viewport).

### 6.5 Aspect-ratio + measure (B5)
- Reusar el existente `--media-ratio` (la card ya lo usa) en product-card (default 4/5) y media-grid
  (default 4/3 y 1/1 — el `--square` puede seguir siendo 1/1 estructural; el plan decide si el 1/1 se
  tokeniza o queda como variante). Cada slot lee `var(--media-ratio, <default>)`.
- `--measure: 65ch;` para `.mui-prose` y tooltip; unificar los 65ch/70ch inconsistentes a un solo token
  (default 65ch). Los otros `ch` (40/46/52/62) que sean measures de marca → el plan evalúa si entran a
  `--measure` o quedan como valores locales de esa pieza (no todos son "la" medida de lectura).

## 7. Entregables y mapa de archivos

- **`tokens/milpa-tokens.json`** — todos los tokens nuevos (fonts heading/body/serif, weight-semibold,
  grupo `size`). `npm run build` regenera dist.
- **`dist/milpa-tokens.css` + `dist/tailwind.config.js`** — regenerados (no editar a mano; el `--check` lo verifica).
- **CSS** (`primitives`/`components`/`artifacts`/`layouts`) — repunte de `--font-display`→heading/body,
  outlines→focus tokens, bordes→`--border-width`, containers/shell/measure→sus tokens. Todo dentro de su `@layer`.
- **`scripts/verify-theme.mjs`** — validación por forma de los 7 grupos.
- **`theme.contract.json`** — grupo `size` + distinción hard/form + prosa honesta.
- **`THEMING.md`** — sección de carga de fuentes + doc del split heading/body/serif + qué gatea el gate.
- **Contratos de piezas de texto** — donde documenten la fuente, notar heading vs body (los que apliquen).
- **`package.json`/`CHANGELOG.md`/`README.md`/`HANDOFF.md`** — bump 0.7.0, changelog «la piel», docs.
- Publicación npm + tag/release `v0.7.0`: **acción de Rod**.

## 8. Verificación

- `npm test` verde (193 AA + governance + 68 contratos + drift `build-tokens --check` + layer-guard).
- `npm run verify:theme -- proof/themed-skin.css` ALL PASS.
- **Prueba central (cero cambio):** diff de `getComputedStyle` en los 6 proofs, dark+light — CERO
  diferencias vs. el estado pre-0.7 (todos los defaults iguales). Fuentes por defecto siguen resolviendo
  a Space Grotesk; bordes 1px; focus 2px; containers/shell/drawer/measure iguales.
- **Prueba de que el surface FUNCIONA:** un skin de prueba que setee `--font-body:'Georgia'`,
  `--border-width:2px`, `--focus-width:3px`, `--container-max:60rem` → los títulos quedan en Space
  Grotesk pero el cuerpo en Georgia, los bordes engordan, el anillo de foco engorda, la página angosta.
- **Prueba de que el gate ENFORCE:** un skin con un token malformado (ej. `--dur-base: rojo` o
  `--font-body:` vacío) → `verify-theme` ahora FALLA (exit 1), donde antes daba ALL PASS.

## 9. Preguntas abiertas

Ninguna — decidido en brainstorming: split 2-tier (heading/body, display=alias); `verify-theme` por
forma (tipo+no-vacío, fail en malformado); los 4 grupos de dimensiones estructurales; fonts.css = solo
doc; el split repunta todo el bundle; nombre «la piel» (vetable). El plan afina detalles quirúrgicos (la
clasificación exacta heading/body por selector; qué `ch` entran a `--measure`; si el 1/1 del media-grid
se tokeniza).
