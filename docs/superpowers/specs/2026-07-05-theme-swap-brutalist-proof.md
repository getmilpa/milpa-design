# Proof de theme-swap — Milpa ⇄ Brutalist (¿alcanza el reskin por tokens para marca?)

- **Fecha:** 2026-07-05
- **Estado:** aprobado (brainstorming) → build directo (un solo artefacto, sin SDD)
- **Tipo:** proof/experimento — NO es una pieza del sistema ni entra al gate de release.

## 1. Hipótesis / pregunta

Post-0.7.0, ¿un reskin **solo con tokens (nivel L1 del contrato)** alcanza para un cambio de marca
**dramático** — Milpa (orgánico, cálido, Space Grotesk, esquinas suaves, sombras difusas) →
**Neo-brutalist** (crudo, gritón, mono, esquinas 0, bordes gruesos, sombras offset duras), su opuesto
visual — manteniendo light + dark en ambos? El proof lo muestra en vivo y lo **valida contra el
contrato** (`verify-theme`).

## 2. La regla del experimento (no negociable)

El skin Brutalist es **exclusivamente overrides de tokens** (custom properties en `:root`/`[data-*]`),
**cero CSS estructural**. Si algún aspecto del look NO se logra por token y requiere L2 (CSS propio del
consumidor), **eso es un hallazgo** — se documenta en el reporte, no se resuelve con L2 a escondidas.
El objetivo es medir el alcance real de L1.

## 3. Mecanismo — un 2º eje de skin

Milpa ya usa `[data-theme="dark"|"light"]` para el modo. Para la MARCA se agrega un 2º eje
`[data-skin="brutalist"]` en `<html>` (Milpa = default, sin atributo). El skin Brutalist es un `<style>`
(o archivo) **sin `@layer`** que redefine tokens bajo:
- `[data-skin="brutalist"][data-theme="light"] { … }`
- `[data-skin="brutalist"][data-theme="dark"] { … }`
Gana por origen de capa (CSS sin capa > `@layer milpa.*`) — el mecanismo documentado en THEMING.md.
Cuatro estados: Milpa-light, Milpa-dark, Brutalist-light, Brutalist-dark.

## 4. La página — `proof/theme-swap.html`

Un "kitchen sink" compacto que muestra piezas representativas de todo el sistema para que el swap se lea
de un vistazo: escala tipográfica + headings, botones (todas las variantes), inputs/form, badges, una
`mui-card`, un `mui-alert`/callout, un `mui-stat`, una tabla chica, y (si entra limpio) un `mui-chart`.
Una **barra de control** fija arriba con dos toggles: **Tema [Milpa ⇄ Brutalist]** y **Modo [Light ⇄
Dark]** — swap instantâneo por JS (setea `data-skin` + `data-theme` en `<html>`). GIF/screenshots de los
4 estados para el reporte.

## 5. Dirección Brutalist por token (neo-brutalist)

Todos son overrides de tokens existentes (0.7 hizo la mayoría themeable):
- **Forma:** `--radius-*` → 0 (esquinas duras). `--border-width` → 3px (bordes gruesos).
- **Elevación:** `--shadow-sm/base/md/lg` → offset duro sin blur, p.ej. `4px 4px 0 0 var(--border)` (la
  "caja" brutalista) escalando el offset por nivel.
- **Tipografía:** `--font-heading` y `--font-body` → un stack **monoespaciado** (ej. `'Space Mono',
  ui-monospace, monospace` — ya está en el bundle — o system mono); pesos duros. `--font-mono` igual.
- **Motion:** `--dur-*` → `0ms`/instantáneo; easings lineales. (Brutalism es abrupto.)
- **Focus:** `--focus-width` → 3–4px, `--focus-offset` → 0 (anillo grueso pegado).
- **Color (alto contraste, crudo):**
  - *light:* `--bg` papel casi-blanco, `--text` tinta casi-negra, `--surface` blanco, `--border` negro;
    `--accent` un **gritón** (magenta `#FF2E88`-ish o amarillo señal) con su `--text-on-accent` legible.
  - *dark:* `--bg` negro puro, `--text` blanco, `--border` blanco, mismo acento gritón.
  - Todos los pares tienen que cumplir el contraste AA del contrato (ver §6).
- `--measure` puede ensancharse (brutalism no cuida el ancho de lectura).

## 6. Validación (el bonus)

El skin Brutalist (los 4 bloques de tokens) se corre por **`npm run verify:theme -- <skin>`** y debe dar
**ALL PASS**: contraste AA en dark+light + forma bien tipada. Un reskin tan extremo que igual honra el
quality floor es la respuesta más fuerte a la pregunta. (Nota: `verify-theme` solo parsea `--token:#hex`
para color + forma para no-color; el skin de prueba usa hex planos en los tokens semánticos para que el
validador los lea.)

## 7. Verificación en el navegador

Los 4 estados en vivo: el swap Milpa⇄Brutalist cambia forma/color/tipo/sombra/motion de TODAS las piezas
sin recargar; light⇄dark funciona en ambos temas; `getComputedStyle` confirma que los tokens
resuelven a los valores del skin (radios 0, borde 3px, sombra offset, fuente mono). Consola sin errores.

## 8. Entregable

- `proof/theme-swap.html` (+ el skin, inline o `proof/skins/brutalist-skin.css`).
- Un **reporte honesto**: qué se logró 100% por token, y qué (si algo) NO se pudo por L1 y por qué —
  la respuesta real a "¿alcanza el reskin por tokens para theming de marca?".

## 9. Fuera de alcance

No es una pieza del sistema; no toca el bundle, los contratos ni el gate de release. No se publica. Es un
experimento/demostración (queda como proof, como los demás).
