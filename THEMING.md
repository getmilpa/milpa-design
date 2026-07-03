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
  --font-display: 'Inter', system-ui, sans-serif;
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

Valida tu CSS de tokens (valores hex planos) contra `theme.contract.json`: reporta qué tokens
de `requiredTokens.color` provee el skin (los que falten se heredan de Milpa — un skin parcial
es un skin válido) y verifica TODOS los pares AA en ambos temas sobre la paleta resultante;
sale con código 1 si algún par falla. Es la implementación de referencia de lo que `coa`
correrá al instalar un plugin con theme propio: **nada se siembra sin contrato — tampoco un
theme.**

**Ejemplo vivo:** el skin "Nopal" (`proof/themed-skin.css`, 12 tokens + radios + cadencia,
193/193 en el gate) vistiendo el blog completo en `proof/themed.html` — nivel 1 por link,
nivel 2 en su `<style>` sin layer.

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
