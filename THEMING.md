# THEMING — inyectar tu propio look & feel en Milpa

> El contrato de theming de `@milpa/design`. La parte legible por máquina vive en
> [`theme.contract.json`](./theme.contract.json) (**generado** desde los tokens + los pares del
> gate — no se edita a mano). Este documento es la parte para humanos: cómo un plugin (o una app)
> reemplaza el diseño — desde un retoque de marca hasta un design system completamente propio —
> sin `!important`, sin guerras de especificidad, y sin romper el quality floor.

## 1. Qué es

Milpa separa **sistema** de **piel**. El sistema (layout, estados ARIA, a11y, motion contract) es
de todos; la piel (color, tipografía, radios, sombras, animaciones) es tuya si la querés. La
costura entre ambos es un contrato: `theme.contract.json` declara qué tokens debe proveer un
theme, qué pares de contraste deben cumplir AA, y qué invariantes sobreviven a cualquier swap.
El mecanismo de inyección (DI) lo resuelve el framework; este paquete garantiza que **cualquier
CSS que cargues después gana** — eso es todo lo que un theme necesita.

## 2. Cómo funciona la cascada

Todo el CSS publicado por `@milpa/design` vive en capas nombradas, declaradas en este orden en
cada archivo:

```css
@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;
```

La regla de oro: **el CSS sin layer (o en una capa posterior) del consumidor/plugin SIEMPRE gana —
sin `!important`, sin guerras de especificidad.** Es la plataforma la que lo garantiza: las
declaraciones sin capa tienen prioridad sobre cualquier capa, con cualquier especificidad.

```css
/* tu-app.css — cargado después de los bundles de Milpa */
@import "@milpa/design/css";
@import "@milpa/design/motion.css";
@import "@milpa/design/primitives.css";
@import "@milpa/design/components.css";

/* esto GANA, aunque .mui-btn--primary tenga más especificidad adentro: */
.mui-btn--primary { border-radius: 0; }
```

Nota sobre `!important`: el contrato reduced-motion de `milpa-motion.css` conserva su
`!important` **dentro** de la capa — y en el modelo de capas, un `!important` con capa le gana
incluso al `!important` sin capa. Traducción: nada de lo que inyectes puede animar en contra del
usuario. Es a propósito.

## 3. Nivel 1 · Retokenizar (cambiar de piel)

El swap más barato y el que cubre el 90% de los casos: redefinís custom properties y **todo** el
sistema cambia de piel — layout, estados, a11y y reduced-motion quedan intactos, y `data-theme`
dark/light sigue funcionando.

```css
/* skin "mi-marca" — solo tokens, cero CSS estructural */
:root, [data-theme="dark"] {
  --accent: #7FD1AE;          /* tu acento */
  --accent-hover: #A3E0C6;
  --accent-active: #5CB890;   /* recordá: los fills llevan auto-borde = -active */
  --accent-text: #7FD1AE;
  --focus: #7FD1AE;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --radius-base: 0.25rem; --radius-md: 0.375rem; --radius-lg: 0.5rem;
  --dur-base: 150ms;          /* tu cadencia */
}
[data-theme="light"] {
  --accent: #1B7A52; --accent-hover: #14603F; --accent-active: #0E4A30;
  --accent-text: #14603F; --focus: #14603F;
}
```

Qué debés cumplir: los pares de `contrast.pairs` que toquen los tokens que redefinís (el gate es
por tema — validá dark Y light). Qué no podés romper: los `invariants`.

## 4. Nivel 2 · Reskin (reemplazar la piel de una pieza)

Además de tokens, traés CSS propio que reemplaza la apariencia de cualquier `mui-*` o suma
componentes tuyos. Al no llevar layer, gana siempre:

```css
/* mi primary con esquinas duras y sombra propia */
.mui-btn--primary {
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--accent-active);
  border-color: var(--accent-active);   /* la regla del auto-borde se respeta */
}
.mui-btn--primary:hover { translate: -1px -1px; }
```

Mantené los hooks semánticos: los estados se estilizan vía atributos (`[disabled]`,
`[aria-busy]`, `[aria-selected]`…) — si tu reskin usa clases de estado, rompés el contrato de
introspección que los agentes y el framework consumen.

## 5. Nivel 3 · Reemplazo total (tu propio design system)

No importás `primitives.css`/`components.css`/`artifacts.css`/`layouts.css` y traés los tuyos
(tu propio motion system incluido). Seguís siendo un ciudadano de Milpa si cumplís
`theme.contract.json`:

- **`requiredTokens`** — proveés los tokens semánticos con esos nombres (color, type, space,
  radius, z-index, motion, elevation). Son la lingua franca: cualquier pieza de otro plugin que
  caiga en tu página se pinta con TU piel a través de ellos.
- **`contrast.pairs`** — tus valores pasan los mismos pares AA, en dark y light.
- **`invariants`** — verbatim del contrato:
  1. *reduced-motion parity: every animated affordance has a non-animated equivalent (see motion/milpa-motion.css contract)*
  2. *focus-visible: interactive elements show a visible :focus-visible outline (--focus) >= 3:1 against its background*
  3. *data-theme: `<html>` always carries data-theme="dark" | "light", never absent*
  4. *gold is never a solid fill in light theme (light primary = ghost)* — aplica al theme
     default de Milpa; si tu paleta no usa el oro, tu equivalente es: tu primario debe contrastar
     como fill o volverse ghost, el gate te lo dice.

## 6. Validación

```bash
npm run verify:theme -- mi-skin.css   # scripts/verify-theme.mjs
```

Un PASS garantiza dos cosas, y solo dos (`theme.contract.json.validation`):

1. **`hard` — contraste WCAG AA.** Todos los pares de `contrast.pairs` cumplen su umbral, en
   dark y en light, sobre la paleta resultante (valores hex planos del skin sobre los defaults
   de Milpa). Sale con código 1 si algún par falla.
2. **`form` — buena forma de los tokens no-color que el skin fija.** Cualquier `--token` de los
   grupos `type` / `space` / `radius` / `zIndex` / `motion` / `elevation` / `size` que el skin
   declare se valida por TIPO y no-vacío (p. ej. `--dur-base` debe ser un `<time>`, `--font-body`
   no puede quedar vacío, `--border-width` debe ser un `<length>`) — ver `validation.form.types`
   para la tabla completa por grupo. Sale con código 1 si algún token declarado está mal formado.

Lo que un PASS **no** garantiza: **completitud** (un skin parcial que no toca un grupo es válido
igual — lo que no fijás se hereda de Milpa) ni **magnitudes con buen gusto** (un `--dur-base:
5000ms` bien formado pasa el gate aunque sea una animación pésima; eso es criterio humano, no
contrato). Tampoco parsea los internals de una función CSS: `verify-theme` valida los tokens
no-color por FORMA (tipo + no-vacío), así que un valor como `calc(...)`/`min(...)` se acepta como
length-expression bien formada sin chequear su aritmética. El gate reporta qué tokens de
`requiredTokens.color` provee el skin (informativo) y qué grupos toca; nada de esto sustituye una
revisión de diseño.

Es la implementación de referencia de lo que `coa` correrá al instalar un plugin con theme
propio: **nada se siembra sin contrato — tampoco un theme.**

**Ejemplo vivo:** el skin "Nopal" (`proof/themed-skin.css`, 12 tokens de color + radios +
cadencia, 193/193 en el gate, 0 malformados) vistiendo el blog completo en `proof/themed.html`
— nivel 1 por link, nivel 2 en su `<style>` sin layer. Fixtures del gate de forma:
`proof/skins/broken-skin.css` (3 tokens mal formados → FAIL) y
`proof/skins/valid-partial-skin.css` (skin parcial bien formado → PASS).

## 7. Qué NO hacer

- **No** uses `!important` para pelearle a las capas — no lo necesitás (ya ganás) y rompés la
  historia para el siguiente plugin.
- **No** acerques tu verde de marca al verde de success (~150°): los estados semánticos deben
  seguir distinguiéndose de tu identidad.
- **No** conviertas el oro en fill sólido en light si usás la paleta Milpa (queda ilegible — por
  eso el primario light es ghost).
- **No** rompas la paridad reduced-motion: si tu motion system anima, el contrato global debe
  seguir neutralizándolo bajo `prefers-reduced-motion`.
- **No** estilices estados con clases (`.active`, `.is-open`): el hook de estilo ES el atributo
  ARIA/nativo. Tu theme se integra a un ecosistema que se introspecciona por contratos.

## 8. Tipografía — heading / body / serif / mono

Desde 0.7.0 (**«la piel»**) el bundle ya no referencia un solo token de fuente: hay cuatro,
uno por rol. Los cuatro **heredan el mismo stack por default**
(`'Space Grotesk', system-ui, sans-serif` — `'Space Mono', ui-monospace, monospace` para mono),
así que no tocar nada te deja exactamente donde estabas; overridear uno solo te da una piel
tipográfica distinta sin tocar CSS estructural.

| Token | Rol | Dónde se usa |
| --- | --- | --- |
| `--font-heading` | Títulos | `h1..h6`, `.mui-*__title` (card/drawer/modal/dialog/section), valores display/hero (`.mui-stat__value`), el wordmark de marca (`.mui-sidebar__brand`, `.mui-docs__brand`), eyebrows con voz display |
| `--font-body` | Cuerpo + UI | botones, inputs, labels, nav, badges, tabs, breadcrumbs, tooltips, celdas de tabla, captions/meta — todo lo que no es un título |
| `--font-serif` | Prosa · citas | `.mui-prose` (y sus `blockquote`/encabezados anidados) y `.mui-quote`. Por default hereda `var(--font-body)` — es una palanca de override, no un tercer stack por defecto |
| `--font-mono` | Datos/código | `.mui-code`, `.mui-kbd`, badges de versión, valores tabulares — sin cambios en 0.7.0 |

`--font-display` **sigue existiendo** como alias de compatibilidad hacia atrás
(`--font-display: var(--font-heading)`, declarado en `dist/milpa-tokens.css`): si tu propio CSS
(fuera del paquete) todavía lo referencia, sigue resolviendo. El bundle de Milpa en sí (primitives
/ components / artifacts / layouts) ya NO lo usa en ningún selector — cada regla apunta al tier
correcto de la tabla de arriba.

### Cómo cargar fuentes

**El paquete no distribuye archivos de fuente.** Los cuatro tokens caen a `system-ui` /
`ui-monospace` si no cargás nada — a propósito: cero peso de red por default, cero FOIT/FOUT que
no pediste, y funciona igual de bien detrás de un theme que nunca toca tipografía. Cargar Space
Grotesk / Space Mono (o lo que elijas) es 100% responsabilidad del consumidor.

**Self-host (recomendado — sin dependencia de terceros en runtime):**

```css
/* fonts.css — cargado ANTES de referenciar los tokens, en tu app */
@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/space-grotesk-latin-400.woff2') format('woff2');
  font-weight: 400 500;   /* si el woff2 es variable, un solo @font-face cubre el rango */
  font-style: normal;
  font-display: swap;     /* texto visible con el fallback mientras carga */
}
@font-face {
  font-family: 'Space Mono';
  src: url('/fonts/space-mono-latin-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Space Grotesk', system-ui, sans-serif;
  --font-mono:    'Space Mono', ui-monospace, monospace;
}
```

**Alternativa `<link>` (más simple, depende de un host externo):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono&display=swap" rel="stylesheet">
```

(el `:root` de arriba con los tres tokens sigue haciendo falta — el `<link>` solo trae los
archivos, los tokens deciden dónde se usan.)

### Ejemplo — overridear solo `--font-body`

Cambiás la voz de cuerpo/UI/prosa a una serif editorial y dejás los títulos intactos en Space
Grotesk — cero CSS estructural, un solo token:

```css
:root, [data-theme="dark"], [data-theme="light"] {
  --font-body: 'Georgia', 'Times New Roman', serif;
  /* --font-serif no se toca: por default hereda --font-body, así que
     .mui-prose y .mui-quote cambian de voz junto con el resto del cuerpo.
     Si quisieras que SOLO prosa/citas cambien (dejando botones/inputs/nav
     en el stack original), overrideá --font-serif en vez de --font-body. */
}
```
