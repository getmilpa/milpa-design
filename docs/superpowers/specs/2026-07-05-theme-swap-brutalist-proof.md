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

## 10. Hallazgos (post-build, 2026-07-05)

**Resultado: SÍ — el reskin solo-tokens (L1) alcanza para un cambio de marca dramático.**

- El skin Brutalist (`proof/skins/brutalist-skin.css`) es **100% overrides de token, cero CSS
  estructural**, y **PASA el contrato**: `verify-theme` → **ALL PASS (193 checks AA, 0 malformados)** en
  light + dark (tras 4 ajustes de color en la 1ª iteración — la iteración que el gate está para forzar).
- El swap en vivo da vuelta, en las MISMAS piezas y el MISMO markup: **forma** (radius 0.5rem→0, border
  1px→3px, esquinas duras), **color** (bg/surface/accent/estados), **tipografía** (Space Grotesk→Space
  Mono), **elevación** (`0 2px 8px` blur suave → `4px 4px 0 var(--border)` offset duro) y **motion**
  (200ms→0ms). Verificado por `getComputedStyle` en botones/cards reales + 4 screenshots.
- **Lo que lo hizo posible (mérito de 0.7):** `--shadow-*` son tokens de **valor completo** (box-shadow
  entero) → se puede cambiar la **forma** de la sombra (blur→offset), no solo la intensidad; `--border-width`
  y `--focus-width` se tokenizaron en 0.7; radius/font/motion ya lo eran. El `var(--border)` dentro de la
  sombra resuelve por modo (blanco en dark, negro en light).

**Límites honestos (no bloquearon el brutalismo, pero son reales):**
1. **`border-style` NO es token** (solo `--border-width` + el color). Los componentes hardcodean `solid`;
   un brutalismo que quisiera bordes `dashed`/`double` necesitaría L2. (El neo-brutalismo usa solid → no molestó.)
2. **Los íconos SVG inline** no son tematizables por token (su forma/trazo vive en el markup); heredan
   `currentColor`, así que el color sí sigue el tema, pero el estilo del trazo no.
3. **Cargar la fuente** es responsabilidad del consumidor — acá se reusó Space Mono (ya en el bundle); una
   display brutalista custom habría que cargarla (ya documentado en 0.7 / THEMING.md).

**Veredicto:** para theming de **marca** (color, tipografía, forma, elevación, motion, grosor de borde),
el reskin por tokens es **suficiente** — este proof lo demuestra con el caso extremo, honrando el quality
floor. Los límites restantes son de nicho (border-style, iconos) o ya conocidos y agendados como futuro
(3er eje de tema / forced-colors, breakpoints, densidad, RTL).

### Glass (3er flavor, post-0.8): los 3 huecos, cerrados

El 3er flavor (`proof/skins/glass-skin.css`, glassmorphism) fue elegido a propósito porque **ejercita
exactamente los 3 límites que 0.7/0.8 vinieron a cerrar** — no son límites nuevos, son los mismos de arriba
más el gap de `verify-theme` con superficies translúcidas:

1. **`--border-style` ahora SÍ es token** (era límite #1 de arriba). Glass lo fija a `solid` explícito junto
   a `--border-width: 1px` — el rim fino del vidrio es tan tokenizable como el borde grueso brutalista.
2. **`--surface-backdrop` + `--blur-*`** (0.8): Glass fija `--surface-backdrop: blur(14px) saturate(1.4)` y lo
   consume `.mui-card`/`.mui-modal`/`.mui-drawer` del bundle SIN CSS estructural del skin — más el `.panel`/
   `.swapbar` editoriales del proof, que también lo leen. Sin este token, un `backdrop-filter` real habría
   requerido L2.
3. **La composición alpha-sobre-`--bg` de `verify-theme`** (0.8): Glass fija `--surface`/`--surface-raised`/
   `--overlay` TRANSLÚCIDOS (`#FFFFFFB3` en light, `#FFFFFF1F` en dark) mientras `--bg` permanece OPACO — el
   gate compone la superficie sobre `--bg` antes de medir contraste efectivo, tal como exige el invariante
   `--bg debe ser opaco`. La fixture negativa `glass-broken-skin.css` (Task 4) prueba el caso en que esto
   falla; `glass-skin.css` es la contraparte positiva.

**Iteración del gate (2 rondas, igual que Brutalist):** la 1ª pasada de `verify-theme` reportó 9 FAILs —
`--border`/`--bg` en ambos modos (el rim translúcido quedaba demasiado cerca en luminancia del `--bg`
vívido), `--success`/`--warning` contra `--bg`/su propio `-bg` en light (insuficientemente oscuros para el
`--bg` pastel elegido), y `--text-on-accent`/`--accent-active` en dark (oscurecer el "active" bajaba el
contraste en vez de subirlo, porque el texto ya era oscuro — el fix fue aclarar `--accent-active`, no
oscurecerlo). Tras ajustar esos 8 tokens de color, la 2ª pasada dio **ALL PASS (193 checks, 0
malformados)** en ambos modos.

**Nuance `--bg`-opaco + gradiente editorial:** el invariante exige `--bg` opaco (es la referencia de
composición), así que el "vidrio" no puede pintarse a sí mismo transparente sobre la página — necesita algo
detrás para desenfocar. Esa "cosa detrás" es un `linear-gradient` en `html[data-skin="glass"] body` del
`<style>` del proof: CSS **editorial de página**, no del sistema (Milpa/Brutalist se quedan con
`var(--bg)` plano). El `--bg` del skin (`#DCE8FF` light / `#0B1226` dark) sigue siendo el valor de
referencia opaco que ve `verify-theme` — el gradiente es puramente visual, vive fuera del contrato. El demo
usa un gradiente **match-eado por modo** (claro en light, indigo→púrpura→ciruela profundo en dark) para que
el fondo RENDERIZADO trackee la oscuridad del `--bg` validado — ilustra en vivo el caveat documentado "el
gate compone sobre `--bg`; un backdrop más ocupado o desalineado necesita un chequeo de cordura" (acá los
hacemos coincidir, así el contraste renderizado matchea el que el gate midió).

Con Glass, el proof llega a **6 estados** (Milpa/Brutalist/Glass × light/dark) y las 3 marcas siguen
honrando el mismo contrato — el caso extremo original (Brutalist) y el caso translúcido (Glass) cierran el
espacio de diseño que un reskin L1 puede cubrir sin CSS estructural.
