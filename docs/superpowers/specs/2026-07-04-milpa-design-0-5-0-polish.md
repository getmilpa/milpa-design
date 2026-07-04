# Milpa Design 0.5.0 — "la mano" (pulido · cluster D)

- **Fecha:** 2026-07-04
- **Estado:** aprobado (brainstorming) → pendiente de plan de implementación
- **Versión objetivo:** `@milpa/design@0.5.0` (minor: suma piezas/variantes/utilidades + un JS de referencia; sin breaking changes)
- **Precede a:** plan de implementación (`docs/superpowers/plans/2026-07-04-…-polish.md`)

## 1. Contexto y objetivo

El cluster **D** del backlog (HANDOFF §4 T9) quedó abierto tras 0.4.0: siete piezas de **pulido** que
los battle-tests pidieron. Ninguna es grande; juntas cierran cluster D. **0.5.0 = "la mano":** los
detalles finos, hechos a mano.

## 2. Alcance

Las 7 (aprobadas en brainstorming): D1 `mui-pager` standalone · D2 `mui-stat --lg` · D3 `mui-stack` /
`mui-cluster` · D4 `mui-drawer --docked` · D5 `mui-chart --line` + ticks HTML · D6 slot de mantra del
footer · D7 JS de referencia para thumbs de media-gallery.

**Fuera de alcance (specs posteriores):** los hallazgos **F** (off-canvas → `<dialog>` en el shell docs
[#8], acciones móviles del header [#9], combinador `:is()` con `<picture>` [#10]) y los 2 Minors
diferidos de 0.3 (guard `[hidden]` de `card__media`, guard de set vacío del lightbox del gallery).
Siguen en el HANDOFF.

## 3. Reglas de la casa que se honran (no negociables)

- CSS envuelto en su `@layer` (pager/stack/cluster/footer en `milpa.layouts`; stat/drawer en
  `milpa.components`; chart en `milpa.artifacts`); el gate brace-walk lo verifica.
- **Estado vía atributos ARIA/nativos, nunca clases `.is-*`.**
- **Paleta cerrada:** sin tokens nuevos; todo reusa tokens existentes. Audit de cierre esperado **0
  pares AA nuevos**.
- **Cero JS publicado:** el comportamiento (thumbs, etc.) vive en `a11y.behavior`; el JS de demo vive
  en los proofs.
- Contraste AA, paridad light/dark, paridad reduced-motion, teclado con `:focus-visible`.
- Piezas nuevas → contrato propio (molde de la casa, modelado sobre uno existente). Variantes → se
  documentan en el contrato de la pieza base. Conteo: **65 → 68** (nuevos: `mui-pager`, `mui-stack`,
  `mui-cluster`).

## 4. D1 · `mui-pager` (standalone)

Extrae el idiom de `mui-docs__pager` (grid de 2 columnas, links prev/next con dirección + título) a una
pieza reusable `mui-pager` en `layouts/milpa-layouts.css`.

- **Anatomía:** `.mui-pager` (grid 2 col, gap) › `.mui-pager__link` (`--prev`/`--next`, card silenciosa
  con borde) › `.mui-pager__dir` (rótulo "Anterior/Siguiente", mono/muted) + `.mui-pager__title`. Mismo
  tratamiento visual que el pager de docs hoy (borde subtle → strong en hover, focus ring).
- **Decoupling:** el shell docs **adopta `mui-pager`** — el proof `docs.html` migra su pager a
  `mui-pager` y las reglas `.mui-docs__pager*` se retiran de `layouts/` (extracción real, DRY; si el
  shell necesita un ajuste propio, un modificador `.mui-docs .mui-pager`).
- **a11y:** `<nav aria-label="…">` envolviendo los dos links; cada link navegable, focus-visible.
- **Contrato nuevo:** `layouts/milpa-pager.contract.json` (molde de la casa). Sin tokens nuevos.
- **Proof:** docs (migrado) y, opcional, blog (prev/next entre entradas).

## 5. D2 · `mui-stat --lg`

Variante de tamaño de `mui-stat` (components). `.mui-stat--lg .mui-stat__value` sube a un `font-size`
mayor (token existente, p.ej. `--text-3xl`/`--text-4xl`) para hero-stats/KPIs destacados; label y delta
sin cambio. Variante — se añade a `components/milpa-stat.contract.json` (`variants`), sin contrato nuevo.
Demo: un KPI grande en un proof (saas o commerce). Sin tokens nuevos.

## 6. D3 · `mui-stack` / `mui-cluster` (utilidades de layout)

Dos utilidades nuevas en `layouts/milpa-layouts.css`:

- **`mui-stack`** — columna con gap consistente (ritmo vertical): `display: flex; flex-direction:
  column; gap: <token>`.
- **`mui-cluster`** — fila que envuelve con gap + alineación: `display: flex; flex-wrap: wrap; gap:
  <token>; align-items: center`.

**Gap por variantes de tamaño** (decisión de brainstorming): `--sm` = `--space-2`, default = `--space-4`,
`--lg` = `--space-6`, mapeadas a tokens de spacing (más descubrible que un custom-property suelto, fiel a
la paleta cerrada). `mui-cluster` acepta además alineación por su uso natural (default center).

- **Contratos nuevos:** `layouts/milpa-stack.contract.json` y `layouts/milpa-cluster.contract.json`
  (molde de la casa; `states` vacío — son utilidades presentacionales). Sin tokens nuevos.
- **Proof:** un bloque en un proof (p.ej. saas/landing) que use `mui-stack` para apilar y `mui-cluster`
  para una fila de badges/botones que envuelve.

## 7. D4 · `mui-drawer --docked`

El `mui-drawer` es un `<dialog>` modal (`position: fixed`, backdrop, slide-in, `[open]`). La variante
**docked** es un **panel lateral persistente**.

- **Decisión (brainstorming):** `--docked` se usa sobre un **`<aside>` estático** (landmark/region — la
  semántica a11y correcta para un panel permanente), NO un `<dialog>`. Reusa la piel del drawer (bg
  `--surface`, borde `--border` inline-start, `--shadow`… — revisar cuáles aplican docked) pero:
  `position: static` (fluye en el layout), alto del contenedor (no `100dvh`), **sin backdrop**, **sin
  `[open]`** (siempre visible), **sin animación de entrada**.
- El drawer modal se queda como `<dialog>` sin cambios. `--docked` es la variante inline.
- **a11y:** el consumidor usa `<aside class="mui-drawer mui-drawer--docked" aria-label="…">`; docked no
  atrapa foco ni tiene Esc (no es un dialog). Se **documenta explícitamente que docked ≠ dialog** en el
  contrato (`variants` + `a11y.behavior`).
- **Contrato:** variante `--docked` añadida a `components/milpa-drawer.contract.json`. Sin contrato nuevo,
  sin tokens nuevos.
- **Proof:** un panel lateral estático (p.ej. un filtro/aside en saas o commerce).

## 8. D5 · `mui-chart --line` + ticks HTML

Variante de línea de `mui-chart` (artifacts) + una fila de ticks del eje en **HTML** (el `<text>` del SVG
se distorsiona bajo el escalado del viewBox).

- **La línea:** un `<polyline>` o `<path>` SVG dentro del `.mui-chart__canvas` existente; usa los tokens
  `--viz-*` (paleta de charts ya cerrada) para el trazo, igual que bars/donut. `.mui-chart--line`
  ajusta lo necesario del canvas (aspect, stroke).
- **Los ticks:** una fila nueva `.mui-chart__ticks` (hermana del canvas) con `.mui-chart__tick` spans;
  **`display: flex; justify-content: space-between`** (ticks de categoría equiespaciados — sin
  posicionamiento por-tick ni JS; decisión de brainstorming). Tipografía mono/muted como los ejes.
- **a11y:** el chart mantiene su patrón actual (título + descripción textual / tabla accesible según el
  contrato de chart); los ticks HTML son `aria-hidden` si el eje ya está descrito en el fallback textual.
- **Contrato:** variante `--line` + anatomía `__ticks`/`__tick` añadidas a
  `artifacts/milpa-chart.contract.json`. Sin contrato nuevo, sin tokens nuevos.
- **Proof:** un `chart --line` con su fila de ticks en un proof (docs/saas).

## 9. D6 · slot de mantra del footer

`.mui-footer__mantra` **ya es un slot genérico** (`font-mono`, `text-2xs`, `text-muted`, sin marca
Milpa) que el consumidor llena. El ask ("mantra propio para productos de terceros") está casi cubierto:

- **Documentar** en `layouts/milpa-footer.contract.json` que `__mantra` es el **tagline del producto**
  (cualquier producto, no solo el mantra de Milpa) — un slot opcional.
- **Demo:** un proof (saas o commerce) muestra una tagline **no-Milpa** en `__mantra` (el proof de
  producto de terceros pone la suya), confirmando el slot.
- Sin CSS nuevo (o mínimo si hace falta desacoplar algo Milpa-específico — no lo hay hoy). Sin contrato
  nuevo, sin tokens nuevos.

## 10. D7 · JS de referencia para thumbs de `mui-media-gallery`

El markup existe (`.mui-media-gallery__main` + `__thumbs` + `__thumb[aria-current]`). Falta el **JS de
referencia** que hace el swap.

- **Comportamiento (a `a11y.behavior` del contrato `components/milpa-media-gallery.contract.json`):**
  click en un `.mui-media-gallery__thumb` → cambia el contenido/`src` del `.mui-media-gallery__main` al
  del thumb y mueve `aria-current="true"` al thumb activo (quitándolo del anterior); teclado: los
  thumbs son focusables y Enter/Space activan.
- **JS de demo** en el proof commerce (PDP): el snippet de referencia cableando lo anterior. Cero JS
  publicado (vive en el proof).
- Sin CSS nuevo, sin contrato nuevo (solo `a11y.behavior` + bump de versión del contrato), sin tokens.

## 11. Entregables y mapa de archivos

**CSS (extiende, sin bundle nuevo):**
- `layouts/milpa-layouts.css` — `mui-pager` (+ retirar `mui-docs__pager*`), `mui-stack`, `mui-cluster`.
- `components/milpa-components.css` — `mui-stat--lg`, `mui-drawer--docked`.
- `artifacts/milpa-artifacts.css` — `mui-chart--line` + `__ticks`/`__tick`.

**Contratos:**
- Nuevos: `layouts/milpa-pager.contract.json`, `layouts/milpa-stack.contract.json`,
  `layouts/milpa-cluster.contract.json`.
- Actualizados (variante/behavior + `version` "0.5.0"): `milpa-stat`, `milpa-drawer`, `milpa-chart`,
  `milpa-footer`, `milpa-media-gallery`, y `milpa-docs` (nota de que el pager se extrajo a `mui-pager`).
- Conteo: **65 → 68**.

**Proofs (re-verificados dark/light/móvil/teclado/consola):**
- `proof/docs.html` (pager migrado a `mui-pager`; opcional chart--line), `proof/commerce.html` (stat--lg
  o thumbs JS + footer mantra), `proof/saas.html` (stack/cluster, drawer--docked, chart--line). Se
  reparten los demos; el plan asigna cada uno.

**Release / docs:**
- `package.json` — `0.4.0 → 0.5.0`.
- `CHANGELOG.md` — entrada `[0.5.0] — "la mano"`.
- `README.md` (conteo 65 → 68), `HANDOFF.md` (cluster D **hecho**; F + Minors siguen abiertos).
- Publicación a npm + tag/release `v0.5.0`: **acción de Rod** (2FA/OTP; tag sin firma
  `-c tag.gpgSign=false`; notas espejo del CHANGELOG), como 0.2/0.3/0.4.

## 12. Verificación

- `npm test` verde: contraste (193 + nuevos) + governance (brace-walk + molde + 68 contratos) + drift
  + layer-guard.
- `npm run verify:theme -- proof/themed-skin.css` sigue `ALL PASS`.
- Los proofs tocados verificados a ojo (pager teclado; stat--lg tamaño; stack/cluster ritmo y wrap;
  drawer docked estático sin backdrop/foco-trap; chart--line con ticks alineados; footer mantra
  no-Milpa; thumbs swap + `aria-current`), dark/light, consola sin errores.

## 13. Preguntas abiertas

Ninguna — las decisiones (gap de stack/cluster por variantes de tamaño; drawer docked como `<aside>`
estático; ticks del chart por `flex space-between`; el resto trivial/casi-hecho; nombre "la mano")
quedaron resueltas en el brainstorming.
