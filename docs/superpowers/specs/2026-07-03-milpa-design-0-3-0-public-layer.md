# Milpa Design 0.3.0 — "la plaza" (la capa pública)

- **Fecha:** 2026-07-03
- **Estado:** aprobado (brainstorming) → pendiente de plan de implementación
- **Versión objetivo:** `@milpa/design@0.3.0` (minor: solo suma piezas y endurece el gate; sin breaking changes)
- **Precede a:** plan de implementación (`docs/superpowers/plans/2026-07-03-…`)

## 1. Contexto y objetivo

Los seis battle-tests de 0.2.0 destaparon que **la cara pública/marketing** de un sitio Milpa
se re-inventa en cada proof: 4 de 6 (landing, blog, saas, gallery) reescriben el header con
prefijo propio (`ld-`, `blog-`, `troje-`, `gal-`) y commerce **abusa** del `mui-topbar` del
shell admin. Faltan además piezas de contenido que blog/marketing necesitan (cover de card,
línea de autoría) y el medio solo acepta `img` (los SVG token-driven no entran). En paralelo, el
check de `@layer` del gate es un substring que no garantiza el invariante de theming.

**0.3.0 = "la plaza":** la capa donde la cosecha se muestra al mundo. Sistematiza el header
público, las piezas de contenido, amplía los slots de medio, y **blinda** el invariante de capas
en el gate.

## 2. Alcance

Se diseñan tres clusters (aprobados en brainstorming):

- **A · `mui-header`** — el header público (barra sólida + off-canvas móvil + variante overlay).
- **B · Contenido/media** — `mui-card__media`, `mui-byline`, media slots `:is(img, svg, picture)`.
- **E · Endurecer el gate** — brace-walk del `@layer` en governance + contrato lightbox-filtro.

**Fuera de alcance (specs posteriores):** cluster **C** (qty stepper extraíble
`mui-input-group--stepper`, tabs variante pill/filtro) y cluster **D** (pager standalone,
`stat --lg`, utilidad stack/cluster, drawer docked, `chart --line` con ticks HTML, slot de mantra
en footer, swap JS de thumbs de media-gallery). Siguen en el backlog del HANDOFF (T9).

## 3. Reglas de la casa que se honran (no negociables)

- Todo CSS publicado declara el orden `@layer` canónico y **envuelve sus reglas en su capa**
  (`mui-header` en `@layer milpa.layouts`; `mui-byline`/`mui-card__media` en `@layer milpa.components`).
- **Estado vía atributos ARIA/nativos, nunca clases `.is-*`.** El estado presentacional
  "scrolled" del overlay usa `[data-scrolled]` (atributo) porque no hay ARIA para "scrolleado".
- **Paleta cerrada:** sin tokens nuevos si se puede; se reusan los semánticos existentes.
- **Cero JS publicado:** el comportamiento vive en `a11y.behavior` del contrato; el JS de demo
  vive en los proofs.
- Contraste AA (4.5 texto / 3:1 UI), paridad light/dark, paridad reduced-motion, teclado.
- Sumar/cambiar una pieza = pieza con `*.contract.json` + pares al gate.

## 4. Sección A · `mui-header`

### 4.1 Taxonomía (decisión)

Milpa pasa a tener **tres headers distintos** (no se unifican):

| Header | Shell | Trabajo | Estado |
|---|---|---|---|
| `mui-topbar` | admin | búsqueda, menú de usuario | ya shippeado, se queda |
| `mui-docs__topbar` | docs | version switcher + nav-toggle de 3 columnas | ya shippeado, se queda |
| `mui-header` | público | nav + CTA + overlay sobre hero | **nuevo** |

Descartado para 0.3: fusionar los tres con variantes `--admin/--docs`. Es DRY pero mete churn y
riesgo en piezas estables sin pagar valor en una release cuyo tema es la capa pública. Se documenta
la taxonomía de "tres headers" en DESIGN/HANDOFF para que no se re-inventen.

### 4.2 Anatomía (slots BEM)

- `.mui-header` — barra sticky. Default sólida: fondo `color-mix(in srgb, var(--bg) 85%, transparent)`
  + `backdrop-filter: blur(10px)`, borde inferior `1px var(--border-subtle)`, `z-index: var(--z-sticky)`.
  Envuelve un `.mui-container` como `.mui-header__row` (flex, `align-items:center`).
- `.mui-header__brand` — link con el wordmark del kit (izquierda).
- `.mui-header__nav` — `<nav aria-label="primary">` con links. Inline en desktop (margin-inline-start:auto
  empuja a la derecha); en móvil se vuelve el panel off-canvas.
- `.mui-header__actions` — cluster derecho: botones (`mui-btn`), theme toggle, CTA.
- `.mui-header__toggle` — botón hamburguesa (`mui-btn--icon`), `aria-expanded` + `aria-controls` →
  id del panel de nav. `display:none` en desktop; visible bajo el breakpoint móvil.

### 4.3 Off-canvas móvil

Reusa el **patrón exacto** del shell docs (`layouts/milpa-layouts.css` §docs responsive): bajo el
breakpoint, `.mui-header__nav` pasa a panel deslizante (fixed, translate fuera de viewport) + scrim
`z-backdrop` (> `z-sticky`, cubre la barra), y la semántica la lleva `aria-expanded` en el toggle.
CSS-driven vía el estado del toggle (mismo mecanismo que docs; si docs usa `:has()`/atributo, se
replica idéntico). El JS de demo (abrir/cerrar, foco al primer link, Esc, restaurar foco al toggle)
vive en el proof; el contrato lo describe en `a11y.behavior`.

### 4.4 Variante `.mui-header--overlay`

Transparente sobre el hero: sin fondo, sin borde. Al pasar un umbral de scroll gana el fondo sólido
vía `[data-scrolled]` en el `<header>` (atributo seteado por el JS del proof, documentado en el
contrato). La transición fondo/borde respeta el contrato reduced-motion (bajo `reduce`, sin
transición).

### 4.5 a11y e invariantes

- Landmark `nav` con `aria-label`; toggle con `aria-expanded`/`aria-controls`; panel con manejo de
  foco + cierre por Esc; navegable por teclado end-to-end con `:focus-visible`.
- **Invariante documentado del overlay:** asume un hero suficientemente oscuro/sólido para preservar
  AA del texto encima (el hero de Milpa lo es). Sobre foto, el consumidor añade scrim. Se anota en
  el contrato y en THEMING/DESIGN como caveat de uso, no como garantía automática.
- **Sin tokens nuevos:** reusa `--bg`, `--border-subtle`, `--z-sticky`, `--z-backdrop`, `--space-*`,
  duraciones/easings de motion.

### 4.6 Migración (dogfood)

- `landing/index.html`: `ld-header/ld-brand/ld-nav` → `mui-header`, estrenando `mui-header--overlay`
  sobre el hero-firma. Se retira el CSS `ld-header*` del `<style>` local.
- `proof/blog.html`: `blog-header*` → `mui-header`.
- `proof/saas.html`: `troje-header*` → `mui-header`.
- `proof/gallery.html`: `gal-header` → `mui-header`.
- `proof/commerce.html`: deja de usar `mui-topbar` (admin) → `mui-header`.
- `proof/docs.html` y el admin proof: **no se tocan** (usan sus topbars propios, correctos).

## 5. Sección B · Contenido/media

### 5.1 `mui-card__media`

Slot de cover edge-to-edge. Hijo directo de `.mui-card`, **antes** de `.mui-card__body`. Sangra a
los bordes de la card y se recorta al `--radius` de la card (esquinas superiores redondeadas, borde
inferior recto cuando está arriba) gracias al `overflow:hidden` de la card. El medio interno
(`:is(img, svg, picture)`) va `width:100%`, `object-fit:cover`, `display:block`, con `aspect-ratio`
por defecto **16 / 9**, override por custom property `--media-ratio`. Compatible con
`.mui-card--interactive` (no interfiere con el hover). Vive en `components/` (`@layer milpa.components`).

### 5.2 `mui-byline`

Línea de autoría (autor+fecha), pensada para ×3 usos (blog, testimonial, cualquier card de contenido).

- `.mui-byline` — fila flex, `align-items:center`, `gap`.
- `.mui-byline__avatar` — **reusa** el primitivo `mui-avatar` (no re-implementa el círculo).
- `.mui-byline__text` — columna: `.mui-byline__name` (`--text`, weight medium) +
  `.mui-byline__meta` (`--text-muted`, `--text-sm`) para "fecha · tiempo de lectura · rol"
  (composable, separadores opcionales).
- Variante `.mui-byline--sm` (avatar y tipografía compactos).
- Sin tokens nuevos. Vive en `components/`.

### 5.3 Media slots `:is(img, svg, picture)`

Hoy el medio se estiliza solo para `img`. Se amplía a `:is(img, svg, picture)` en:

- `components/`: `mui-product-card` (`__media`), `mui-media-gallery`.
- `layouts/`: `mui-media-grid` (`__item`), `mui-lightbox`.

Cambio de selector (no de comportamiento) para que SVG token-driven y `<picture>` entren como medio.
Se documenta en los contratos que el SVG debe traer su propio dimensionado (viewBox/width).
`mui-card__media` (5.1) ya nace con el selector ampliado.

## 6. Sección E · Endurecer el gate

### 6.1 Brace-walk del `@layer` (governance)

Reemplaza el check por substring (`raw.includes('@layer components {')`) por un parseo real en
`scripts/verify-governance.mjs`:

1. Quitar comentarios `/* */` y contenidos de strings.
2. Caminar la profundidad de llaves de todo el archivo.
3. Confirmar que **toda regla de estilo** (bloque `selector { … }`) posterior a la declaración
   canónica `@layer <orden>;` vive **dentro** del `@layer <nombre> { }` del archivo.
4. Cualquier bloque de estilo a profundidad 0 (fuera de capa) → **FAIL**.

Permitido en top-level (profundidad 0): el statement `@layer <orden>;`, `@import`, `@charset`,
comentarios, y el wrapper único `@layer <nombre> { … }`. Los `@media`/`@supports` anidados **dentro**
de la capa son válidos (siguen contando como dentro).

**Test negativo (TDD):** un CSS de prueba con una regla fuera de la capa DEBE hacer fallar el check;
se verifica antes de dar por bueno el brace-walk (se corre el check contra un fixture temporal y se
confirma exit≠0), luego se descarta el fixture. Esto prueba que el check "muerde".

### 6.2 Contrato lightbox-filtro (decisión)

El prev/next del lightbox **respeta el filtro activo**: cicla solo los items visibles (filtrados),
con el contador `n / <cantidad filtrada>`. Es lo que el usuario espera (filtró a "harvest" → prev/next
permanece en harvest). Se prescribe en el contrato (`milpa-lightbox.contract.json` y la nota
correspondiente en `milpa-media-grid.contract.json`) dentro de `a11y.behavior`; el JS del proof
gallery se ajusta (hoy cicla los 12 sin importar el filtro) para honrarlo.

## 7. Entregables y mapa de archivos

**CSS (extiende, sin bundle nuevo):**
- `layouts/milpa-layouts.css` — `mui-header` (+ `--overlay`, off-canvas, `[data-scrolled]`); media
  slots `:is()` en `mui-media-grid` y `mui-lightbox`.
- `components/milpa-components.css` — `mui-card__media`, `mui-byline` (+ `--sm`); media slots `:is()`
  en `mui-product-card` y `mui-media-gallery`.

**Contratos:**
- Nuevos: `layouts/milpa-header.contract.json`, `components/milpa-byline.contract.json`.
- Actualizados: `components/milpa-card.contract.json` (slot `__media`), `milpa-product-card`,
  `milpa-media-gallery`, `layouts/milpa-media-grid`, `layouts/milpa-lightbox` (media slots + filtro).

**Gate / scripts:**
- `scripts/verify-governance.mjs` — brace-walk; el conteo de contratos sube **63 → 65** (dos nuevos:
  header + byline; los demás se actualizan, no suman). Auto-descubierto por directorio; verificar que
  los nuevos entren al conteo del gate.
- `scripts/contrast-pairs.mjs` — auditar superficies nuevas; sumar solo pares genuinamente nuevos.
  Esperado mínimo: el texto del header sólido y del meta del byline reusan pares `--text|--text-muted`
  sobre `--bg` ya cubiertos. El overlay no añade par automático (invariante documentado, §4.5).

**Proofs (re-verificados dark/light/móvil/teclado/consola):**
- `landing/index.html`, `proof/blog.html`, `proof/saas.html`, `proof/commerce.html`,
  `proof/gallery.html` (ver §4.6, §5, §6.2). `proof/docs.html` sin cambios.

**Release / docs:**
- `package.json` — `0.2.0 → 0.3.0`.
- `CHANGELOG.md` — entrada `[0.3.0] — "la plaza"`.
- `README.md`, `HANDOFF.md`, `DESIGN.md` — estado 0.3, taxonomía de tres headers, mover A/B/E fuera
  del backlog T9 (dejar C/D).
- Publicación a npm + tag/release `v0.3.0`: **acción de Rod** (npm 2FA/OTP y push de tag outward-facing).
  El tag se crea sin firma (`-c tag.gpgSign=false`) por consistencia con 0.2.0 y el pinentry.

## 8. Verificación

- `npm test` verde: contraste (193 + nuevos) + governance (molde + brace-walk + ~66 contratos) + drift.
- `npm run verify:theme -- proof/themed-skin.css` sigue pasando (las piezas nuevas reusan tokens del
  contrato; si algún par nuevo entra, el skin Nopal debe honrarlo también).
- Los cinco proofs migrados verificados a ojo en dark/light, móvil (off-canvas), teclado y consola
  (cero errores).

## 9. Preguntas abiertas

Ninguna — las decisiones (taxonomía de tres headers, alcance overlay, default 16/9, ubicación de las
piezas, respetar el filtro en el lightbox, nombre "la plaza") quedaron resueltas en el brainstorming.
