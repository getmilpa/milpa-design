# Milpa Design 0.6.0 — "el deshierbe" (deuda técnica · hallazgos F + Minors)

- **Fecha:** 2026-07-04
- **Estado:** aprobado (brainstorming) → pendiente de plan de implementación
- **Versión objetivo:** `@milpa/design@0.6.0` (minor — el off-canvas de header/docs cambia de comportamiento: `[data-nav-open]` → `<dialog>`/`showModal`; nota de compat en el CHANGELOG; sin ruptura de tokens/paleta)
- **Precede a:** plan de implementación (`docs/superpowers/plans/2026-07-04-…-debt.md`)

## 1. Contexto y objetivo

Con el cluster D cerrado (0.5.0), lo único abierto en el backlog T9 del HANDOFF son los **3 hallazgos F**
que la ejecución de 0.3–0.5 destapó (deuda técnica real, no piezas nuevas) más un puñado de **Minors**.
**0.6.0 = "el deshierbe":** sacar la maleza del campo — arreglar la deuda y cerrar el backlog del todo.

## 2. Alcance

- **F#8 · Off-canvas a `<dialog>`** — el menú móvil de `mui-header` y `mui-docs` pasa a un
  `<dialog class="mui-drawer">` (top layer nativo, no extiende el scroll), eliminando el requisito
  `overflow-x:clip` del consumidor. Resuelve de paso **F#9** (las acciones que no caben — el search de
  commerce — viven dentro del drawer móvil).
- **F#10 · Media slots** — combinador descendiente → hijo (`> :is(img, svg, picture)`) para que un
  `<picture>` matchee una sola vez (evita el double-match del hover-scale).
- **Minors (5):** política del guard `[hidden]` de inner-media (documentar), guard de set vacío del
  lightbox del gallery, `anatomy` de stack/cluster, badge SOC 2, `a11y.aria` del drawer.

**Fuera de alcance:** nada pendiente del backlog T9 tras esto — queda cerrado. (Futuro no-planeado:
Storybook T5, salidas multiplataforma.)

## 3. Reglas de la casa que se honran

- CSS en su `@layer` (el gate brace-walk lo verifica); estado vía ARIA/atributos nativos; paleta cerrada
  (sin tokens nuevos); cero JS publicado (comportamiento en `a11y.behavior`, JS de demo en proofs);
  AA / light-dark / reduced-motion / teclado.
- Cambiar la forma/semántica de un contrato = bump semver. El off-canvas de header/docs cambia de
  mecanismo → **minor 0.6.0 con nota de compat**.

## 4. F#8 · Off-canvas a `<dialog>` (el rework)

### 4.1 El patrón nuevo

El menú móvil deja de ser un panel `position:fixed` translado fuera de pantalla (que extiende el scroll
horizontal del documento salvo que el consumidor haga `overflow-x:clip` — la causa raíz del bug de
docs.html) y pasa a ser un **`<dialog class="mui-drawer">`** — la primitiva que ya existe
(`components/milpa-components.css` §Drawer: `showModal()` da top layer, focus-trap, Esc y `::backdrop`).
El **top layer no extiende el scroll del documento**, así que el requisito `overflow-x:clip`
**desaparece por completo** para todos los consumidores.

### 4.2 `mui-header`

- **Desktop:** `.mui-header__nav` sigue siendo el `<nav>` inline con los links. Sin cambios.
- **Móvil (≤880px):** el `.mui-header__nav` inline se oculta; la hamburguesa `.mui-header__toggle` abre
  (`showModal()`) un `<dialog class="mui-drawer">` que el consumidor provee con **los links + las
  acciones de barra que no caben (search, etc.)**. El drawer da el slide-in/backdrop/Esc/focus-trap.
- **Se borra** del CSS del header (`layouts/milpa-layouts.css`): el bloque `@media (max-width:880px)` del
  `.mui-header__nav` (el `position:fixed`/`translateX`/`visibility`/transición), la regla
  `.mui-header__scrim`, y todas las reglas de estado `.mui-header[data-nav-open]`. El `.mui-header__toggle`
  (display + su regla) se mantiene (ahora abre el dialog). **El `--overlay` / `[data-scrolled]` NO se
  toca** (es del hero, ortogonal).
- El `.mui-header__scrim` como elemento del markup ya no se usa (el `::backdrop` del dialog lo reemplaza).

### 4.3 `mui-docs`

- **Desktop:** la sidebar `.mui-docs__nav` sigue siendo la columna izquierda del grid. Sin cambios.
- **Móvil (≤880px):** el `.mui-docs__nav-toggle` abre (`showModal()`) un `<dialog class="mui-drawer">` con
  el árbol de nav. Se borran del shell docs el bloque `@media (max-width:880px)` que volvía `.mui-docs__nav`
  un panel fixed off-canvas + el `.mui-docs__scrim` + el estado `.mui-docs[data-nav-open]`.
- **Placement del drawer (decidido):** `mui-drawer` ancla al `inline-end` (derecha), que coincide con el
  toggle del header (a la derecha) → el header usa el drawer **default**. El nav de docs vive a la
  izquierda y su toggle también → se añade una variante **`mui-drawer--start`** (izquierda:
  `inset-inline-start:0`, borde `inline-end`, slide desde `translateX(-100%)`) y el shell docs la usa,
  para que el menú abra del lado del toggle. La variante se documenta en el contrato del drawer.

### 4.4 Trade-off (aceptado en brainstorming)

El menú móvil es un elemento **aparte** del nav inline → los links se **duplican** (el consumidor los
escribe en el nav inline y en el drawer). Es el patrón estándar de "mobile menu". A cambio: cero
requisito de overflow, focus-trap/Esc/backdrop nativos, y **un solo patrón de off-canvas** en todo el
sistema (header + docs + drawer).

### 4.5 JS de demo (proofs)

`toggle.addEventListener('click', () => menuDialog.showModal())`; el `aria-expanded` del toggle se
sincroniza con el open/close del dialog (`dialog.addEventListener('close', …)` lo baja a `false`). Reemplaza
el toggle de `[data-nav-open]` + scrim de los proofs.

### 4.6 Contratos

- `layouts/milpa-header.contract.json`: documentar el patrón móvil nuevo (menú = `mui-drawer` vía
  `showModal`; links duplicados; el toggle abre el dialog; **el requisito `overflow-x:clip` queda
  eliminado**). `version` "0.6.0". Quitar la nota vieja del `[data-nav-open]`/scrim.
- `layouts/milpa-docs.contract.json`: idem para el shell docs. `version` "0.6.0".
- `components/milpa-drawer.contract.json`: documentar la variante `--start` (§4.3) + el Minor de a11y.aria
  (§6.5). `version` "0.6.0".

## 5. F#10 · Media slots: descendiente → hijo

Cambiar `:is(img, svg, picture)` de combinador descendiente a **hijo** en los slots donde el medio es
hijo directo, igual que `mui-card__media` ya lo hace (`components/milpa-components.css:217`):

- `layouts/milpa-layouts.css`: `.mui-media-grid__item :is(…)` (incluye `:hover … scale(1.03)` y masonry
  `height:auto`) → `> :is(…)`; `.mui-lightbox__media :is(…)` → `> :is(…)`.
- `components/milpa-components.css`: `.mui-product-card__media :is(…)` (+ el `[aria-disabled]`),
  `.mui-media-gallery__main :is(…)`, `.mui-media-gallery__thumb :is(…)` → `> :is(…)`.

Así un `<picture>` matchea una sola vez (el hijo directo), no el `<picture>` **y** su `<img>` interior
(evita el hover-scale compuesto ≈1.061). **El plan confirma que en cada slot el medio es hijo directo**
(si algún slot envuelve el medio en otro elemento, ese queda con descendiente y se documenta). Los
contratos de esos slots notan que un `<picture>` se coloca como **hijo directo** del slot. Sin cambio de
conteo de contratos.

## 6. Minors

### 6.1 Política del guard `[hidden]` de inner-media

Decisión (del review final de 0.3): las reglas de **inner-media** (`card__media` y los media slots) que
setean `display` **NO** llevan guard `[hidden]` — no son targets de hide/show; la regla dura de la casa
guardea los **contenedores/targets** que un filtro oculta (ej. `.mui-media-grid__item[hidden]`), no el
medio interno. Se **documenta la política** en `DESIGN.md` (§6 quality floor o donde vive la regla del
guard) + un comentario breve. **Sin cambio de código** en `card__media`. Cierra la ambigüedad que abrió
el review de 0.3.

### 6.2 Guard de set vacío del lightbox del gallery

En `proof/gallery.html`, el `show(i)` del lightbox: agregar `if (!items.length) return;` al inicio (evita
`(i+0)%0 = NaN` → `items[NaN]` undefined → TypeError si un filtro futuro deja 0 items). Una línea.

### 6.3 `anatomy` de stack/cluster

`layouts/milpa-stack.contract.json` y `layouts/milpa-cluster.contract.json`: agregar un `anatomy` con la
entrada `root` (`.mui-stack` / `.mui-cluster`) para paridad con los demás contratos de layouts. `version`
"0.6.0".

### 6.4 Badge SOC 2

Estandarizar la variante de "SOC 2 Type II" a **una sola** en `proof/saas.html` (hoy `--secondary` en el
hero, `--accent` en Trust/Preview) y en los ejemplos de `milpa-stack`/`milpa-cluster` (hoy discrepan
entre sí). El plan elige la variante (recomendación: `--accent`, la más usada). Cosmético.

### 6.5 `a11y.aria` del drawer

`components/milpa-drawer.contract.json`: añadir al array `a11y.aria` una línea para el patrón docked
(`<aside aria-label="…">` — sin `aria-labelledby` de dialog ni botón de cierre). `version` "0.6.0".

## 7. Entregables y mapa de archivos

**CSS:**
- `layouts/milpa-layouts.css` — borrar el off-canvas móvil de `mui-header` (§4.2) y `mui-docs` (§4.3);
  media slots `> :is()` (§5).
- `components/milpa-components.css` — media slots `> :is()` (§5); variante `mui-drawer--start` (§4.3).

**Contratos:** `milpa-header`, `milpa-docs`, `milpa-drawer` (patrón móvil + `--start` + aria), + los
contratos de media slots (nota `<picture>`), `milpa-stack`/`milpa-cluster` (anatomy). Todos `version`
"0.6.0". **Conteo sigue 68** (docs/variantes, no piezas nuevas).

**Proofs (re-verificados dark/light/MÓVIL/teclado/consola):**
- Migrar el nav móvil de `landing/index.html`, `proof/blog.html`, `proof/saas.html`, `proof/gallery.html`,
  `proof/commerce.html` y `proof/docs.html` a un `<dialog class="mui-drawer">` abierto por el toggle
  (`showModal`); **quitar `html,body{overflow-x:clip}`** de blog/saas/gallery/commerce; el search de
  commerce entra al drawer móvil (F#9); estandarizar el badge SOC 2 (§6.4); el guard del gallery (§6.2).
- El landing conserva su hero-firma GSAP; su menú móvil también pasa al drawer.

**DESIGN.md:** la política del guard `[hidden]` (§6.1).

**Release / docs:**
- `package.json` — `0.5.0 → 0.6.0`.
- `CHANGELOG.md` — entrada `[0.6.0] — "el deshierbe"` con **nota de compat** (off-canvas de header/docs
  ahora es `<dialog>`/`showModal`; se removió el requisito `overflow-x:clip`; los consumidores del
  off-canvas viejo migran el toggle a `showModal` sobre un `mui-drawer`).
- `README.md`, `HANDOFF.md` — marcar F#8/#9/#10 + los Minors hechos → **el backlog T9 queda cerrado**.
- Publicación npm + tag/release `v0.6.0`: **acción de Rod** (2FA/OTP; tag sin firma; notas espejo del
  CHANGELOG).

## 8. Verificación

- `npm test` verde (193 AA + governance brace-walk + 68 contratos + drift + layer-guard).
- `npm run verify:theme -- proof/themed-skin.css` ALL PASS.
- **El punto de esta release, en el navegador @390px:** en TODOS los proofs (incl. docs.html) el
  `document.scrollWidth - clientWidth === 0` (cero overflow horizontal) SIN `overflow-x:clip`; el menú
  móvil abre como `<dialog>` (top layer), cierra con Esc / backdrop / botón, atrapa el foco, y el toggle
  sincroniza `aria-expanded`. Commerce: el search está accesible dentro del drawer móvil. Dark/light,
  consola sin errores.
- Verificar que un `<picture>` en un media slot no dispara el hover-scale doble (medir el transform).

## 9. Preguntas abiertas

Ninguna — las decisiones (F#8 = rework a `<dialog>` con links duplicados y search en el drawer; F#10 =
combinador hijo; la política del guard = documentar, no guardear inner-media; el resto de Minors; el
placement del drawer para docs lo afina el plan; nombre "el deshierbe") quedaron resueltas en el
brainstorming.
