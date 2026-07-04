# Milpa Design 0.4.0 — "el trato" (interacción · cluster C)

- **Fecha:** 2026-07-04
- **Estado:** aprobado (brainstorming) → pendiente de plan de implementación
- **Versión objetivo:** `@milpa/design@0.4.0` (minor: solo suma variantes + un patrón documentado; sin breaking changes)
- **Precede a:** plan de implementación (`docs/superpowers/plans/2026-07-04-…`)

## 1. Contexto y objetivo

El backlog del HANDOFF (§4 T9, cluster C) quedó abierto tras 0.3.0: dos piezas de **interacción** que
los battle-tests pidieron pero no se sistematizaron. Un **qty stepper** (hoy `.mui-cart-line__qty` es
solo un `.mui-input` pelado — no hay stepper de verdad que extraer) y una variante **pill/filtro** de
`mui-tabs` (el gallery improvisó filtros con `role="tab"` + un solo `aria-controls`, sin formalizarlo).

**0.4.0 = "el trato":** los controles de la transacción — elegir cantidades y filtrar colecciones.

## 2. Alcance

- **C1 · `mui-input-group--stepper`** — número flanqueado por botones −/+ (nuevo; cart-line lo adopta).
- **C2 · `mui-tabs--pill` + patrón de filtro** — variante visual pill de tabs + el patrón ARIA de
  panel único documentado (formaliza lo del gallery).

**Fuera de alcance (specs posteriores):** cluster **D** (pager standalone, `stat --lg`, utilidad
stack/cluster, drawer docked/inline, `chart --line` con ticks HTML, slot de mantra en footer, swap JS
de thumbs) y los hallazgos **F** (off-canvas a `<dialog>` en header+docs, acciones móviles del header,
combinador de media con `<picture>`, 2 guards diferidos). Siguen en el HANDOFF.

## 3. Reglas de la casa que se honran (no negociables)

- CSS envuelto en su `@layer` (stepper en `@layer milpa.primitives`; pill en `@layer milpa.components`);
  el gate brace-walk (0.3) lo verifica.
- **Estado vía atributos ARIA/nativos, nunca clases `.is-*`:** stepper usa `[disabled]` en los botones
  y `min/max/step` nativos; pill usa `[aria-selected="true"]`.
- **Paleta cerrada:** sin tokens nuevos. La pill seleccionada reusa `accent-text`/`accent-subtle`
  (par ya gateado); el stepper reusa tokens de input/btn/spacing/radius.
- **Cero JS publicado:** el comportamiento vive en `a11y.behavior`; el JS de demo vive en los proofs.
- Contraste AA, paridad light/dark, paridad reduced-motion, teclado con `:focus-visible`.
- **Variantes, no piezas nuevas:** se suma `--stepper` al contrato de input-group y `--pill` + el
  patrón de filtro al de tabs → **el conteo de contratos sigue en 65** (governance no cambia).

## 4. Sección C1 · `mui-input-group--stepper`

### 4.1 Anatomía (segmentado — lee como un solo control)

`.mui-input-group--stepper` es `inline-flex`, con el **borde + `border-radius`** en el grupo (no en el
input). Adentro, tres hijos a ras:

- `.mui-input-group__step` — botón decremento (−), a la izquierda.
- `.mui-input` — número, **borderless** (borde 0, fondo transparente), centrado, ancho fijo (~3rem).
- `.mui-input-group__step` — botón incremento (+), a la derecha.

`.mui-input-group__step` es un botón ghost-ish con la altura del grupo, esquinas redondeadas solo del
lado externo del grupo (start-start/start-end en el −, end-* en el +). Soporta el tamaño `--sm` (lo que
usa cart-line). Sin tokens nuevos.

### 4.2 Estado y a11y

- El input es `type="number"` con `min`/`max`/`step`; el teclado nativo (↑/↓) ya incrementa/decrementa
  — los botones son **afordancia redundante**, no la única vía.
- Los botones `.mui-input-group__step` se deshabilitan en los límites vía `[disabled]` (los setea el
  JS del consumidor; el CSS solo estiliza el estado). Cada botón lleva `aria-label`
  ("Decrease quantity" / "Increase quantity"); el input es el control etiquetado (label asociado o
  `aria-label`).
- **`a11y.behavior` del contrato:** el consumidor cablea click en −/+ → ajusta `value` respetando
  `min`/`max`/`step`, deshabilita el botón del límite alcanzado, y emite `input`/`change`. Reduced-motion
  no aplica (sin animación propia).

### 4.3 Migración

`.mui-cart-line__qty` (hoy `inline-flex` con un `.mui-input` de 3rem) pasa a envolver un
`.mui-input-group--stepper --sm`. El proof **commerce** lo demuestra en el **cart drawer** (con el JS
de demo que clampa y deshabilita en los límites). El `.mui-cart-line__qty` como slot de layout se
mantiene; cambia su contenido.

### 4.4 Contrato

Se añade la variante `--stepper` (con su `anatomy` `__step`, estados y `a11y.behavior`) al contrato del
input-group — `primitives/milpa-input.contract.json` (confirmado: ahí viven hoy la `anatomy` de
input-group `group`/`group__prefix`/`group__suffix` y sus variantes `--prefix`/`--suffix`; no hay
contrato de input-group aparte). `version` → `"0.4.0"`. Sin campos nuevos fuera del molde.

## 5. Sección C2 · `mui-tabs--pill` + patrón de filtro

### 5.1 `--pill` (variante visual)

Variante de `.mui-tabs`. Sobre `.mui-tabs--pill`:

- El contenedor pierde la línea base (`border-bottom`) y su `gap` se mantiene.
- Cada `.mui-tabs__tab` deja de usar el subrayado (`border-bottom` indicador) y pasa a **pill**:
  `border-radius` redondeado, padding horizontal, altura propia; default fondo transparente + texto
  `--text-secondary`; hover fondo `--surface` + texto `--text`; seleccionada `[aria-selected="true"]`
  = fondo `--accent-subtle` + texto `--accent-text` (**el fill ES el indicador**, no el subrayado).
- El `:focus-visible` mantiene el ring (`--focus`), ahora con `outline-offset` positivo (la pill no
  vive sobre una línea base). El slot de conteo (`.mui-badge` dentro del tab) sigue componiendo.
- Aplicable tanto a tabs de contenido normales como a filtros (es solo lo visual).

### 5.2 Patrón de filtro (documentado — tablist de panel único)

Decisión tomada en brainstorming: se formaliza el modelo que ya shippeó el gallery. En
`components/milpa-tabs.contract.json` → `a11y.behavior` se documenta el **patrón de filtro**:

- Todas las `role="tab"` de un `role="tablist"` apuntan a **una sola** región `role="tabpanel"` vía
  `aria-controls` (no una tab-un-panel).
- Seleccionar una tab **filtra** los ítems de esa región vía el atributo `[hidden]` (no cambia de
  panel). El contador/región se actualiza.
- Teclado: roving `tabindex` (solo la tab activa es tabbable), flechas ←/→ mueven selección, Home/End
  al extremo; el JS del consumidor sincroniza `aria-selected` + el filtro.
- **Caveat semántico documentado:** `role="tab"` implica cambiar de panel; para un filtro (elegir uno
  de N que filtra en su lugar) es un estiramiento aceptado del patrón, elegido por familiaridad ("filter
  tabs") sobre un toolbar de `aria-pressed` — se anota para que el consumidor lo sepa.

### 5.3 Migración

Los filter tabs del proof **gallery** (hoy underline) adoptan `.mui-tabs--pill` — demuestra la variante
visual Y el patrón de filtro documentado en un solo lugar. El JS de filtro del gallery ya existe (0.2/0.3)
y no cambia; solo se añade la clase `--pill` y se ajusta el CSS de foco si hiciera falta.

### 5.4 Contrato

`components/milpa-tabs.contract.json`: añadir la variante `--pill` (a `variants`) y el patrón de filtro
(a `a11y.behavior`). `version` → `"0.4.0"`. Molde intacto.

## 6. Entregables y mapa de archivos

**CSS (extiende, sin bundle nuevo):**
- `primitives/milpa-primitives.css` — `.mui-input-group--stepper` + `.mui-input-group__step` (dentro de
  `@layer milpa.primitives`, junto al cluster input-group).
- `components/milpa-components.css` — `.mui-tabs--pill` + sus reglas de tab pill (dentro de
  `@layer milpa.components`, junto al cluster tabs).

**Contratos (variantes, sin archivos nuevos):**
- `primitives/milpa-input.contract.json` — variante `--stepper` (ahí vive input-group; confirmado).
- `components/milpa-tabs.contract.json` — variante `--pill` + patrón de filtro.
- Ambos `version` → `"0.4.0"`. Conteo de contratos: **65 (sin cambio)**.

**Proofs (re-verificados dark/light/móvil/teclado/consola):**
- `proof/commerce.html` — cart-line adopta el stepper (cart drawer) + JS de demo (clamp/disable).
- `proof/gallery.html` — filter tabs adoptan `--pill` (el JS de filtro no cambia).

**Release / docs:**
- `package.json` — `0.3.0 → 0.4.0`.
- `CHANGELOG.md` — entrada `[0.4.0] — "el trato"`.
- `README.md`, `HANDOFF.md` — marcar cluster **C hecho** en el backlog; mantener **D** y **F** abiertos.
- Publicación a npm + tag/release `v0.4.0`: **acción de Rod** (2FA/OTP; tag sin firma
  `-c tag.gpgSign=false`; notas espejo del CHANGELOG), como 0.2/0.3.

## 7. Verificación

- `npm test` verde: contraste (193 + cualquier nuevo) + governance (brace-walk + molde + 65 contratos)
  + drift + layer-guard.
- `npm run verify:theme -- proof/themed-skin.css` sigue `ALL PASS` (las variantes reusan tokens del
  contrato; si entrara un par nuevo, el skin Nopal debe honrarlo).
- commerce y gallery verificados a ojo en dark/light, móvil y teclado (stepper: ↑/↓ + botones, disable en
  límites; pill: selección, flechas, foco), consola sin errores.

## 8. Preguntas abiertas

Ninguna — las decisiones (stepper segmentado, fill de la pill = `accent-subtle`/`accent-text`, tablist de
panel único para el filtro, gallery adopta `--pill`, nombre "el trato") quedaron resueltas en el
brainstorming.
