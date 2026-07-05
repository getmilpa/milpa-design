# Milpa Design System · `@milpa/design`

> **La cara visual del framework [Milpa](https://milpa.lat).** Tokens dark-first, motion, y
> contratos de componente introspectables. *Siembra módulos, cosecha aplicaciones.*

Repo hermano del framework **Milpa** (core PHP + CLI `coa`). Este paquete se desarrolla y
**versiona por separado** y el framework lo **consume por versión** (`@milpa/design@x.y.z`) — así
ambos avanzan en paralelo sin pisarse. La costura entre los dos es un **contrato**: los tokens
(DTCG) + los `*.contract.json` de cada componente. *(Milpa aplicado a sí mismo.)*

- **Framework / plan maestro:** `VISION.md` (repo `teamx` / futuro `github.com/getmilpa`).
- **La constitución de este DS:** [`DESIGN.md`](./DESIGN.md) — léela primero. Describe el *alma* y
  las reglas, no solo los valores.

## Estado

**v0.6 — el deshierbe: cierre del backlog T9 (hallazgos F #8/#9/#10 + los Minors del review de
0.3.0).** Paleta cerrada: `oro` (primario) + `olivo` (secundario / la milpa viva) + `tierra`
(neutro); `cielo` = `info`; y `--syntax-*` (highlighting AA-verificado) y `--viz-*` (charts,
colorblind-safe) — semánticos de las mismas rampas. **193/193 pares WCAG AA** (dark + light,
`npm test`). **68 piezas** con contrato en cuatro capas (sin piezas nuevas de peso — `mui-drawer`
suma `--start`, anclado a la izquierda, variante): primitivas (*el grano*), componentes admin +
commerce (*el frijol*), artefactos de contenido (*el elote*: code, terminal, chart, prose, api,
search, kit de versionado…) y layouts (*la parcela*: el shell de docs versionadas, hero, pricing,
faq, footer, media-grid, lightbox, `mui-header`…). **Tres headers, tres contextos:**
`mui-topbar` (shell admin) / `mui-docs__topbar` (shell docs) / `mui-header` (sitio público —
marketing, con variante overlay); el off-canvas móvil de `mui-header` y del shell docs es ahora un
**`<dialog class="mui-drawer">` nativo** abierto con `showModal()` (top layer: focus trap/Esc/
backdrop gratis, sin `overflow-x:clip` en la raíz de la página — ver nota de compat en
[`CHANGELOG.md`](./CHANGELOG.md)). Todo el CSS publicado vive en **`@layer
milpa.*`**: el CSS de un plugin/consumidor gana sin `!important` — el theming es contrato
([`THEMING.md`](./THEMING.md) + `theme.contract.json` generado). Seis battle-tests en `proof/`
(docs, blog, commerce, gallery, saas y `themed` — el blog vistiendo un skin que pasa el mismo
gate).

## Estructura

```
tokens/milpa-tokens.json    # DTCG — FUENTE DE VERDAD
dist/                       # salidas consumibles (CSS vars + preset Tailwind) — GENERADAS (npm run build, drift-gated en CI)
motion/                     # "el viento": easings + primitivas + contrato reduced-motion
primitives/                 # el grano: Button, Input, Field, controles… (+ *.contract.json)
components/                 # el frijol: Card, Table, Modal, Shell admin, commerce… (+ *.contract.json)
artifacts/                  # el elote: Code, Terminal, Chart, Prose, Api, Search, versionado… (+ *.contract.json)
layouts/                    # la parcela: Docs shell, Hero, Pricing, Faq, Footer, MediaGrid, Lightbox… (+ *.contract.json)
theme.contract.json         # contrato de theming — GENERADO (tokens requeridos + pares AA + invariantes)
THEMING.md                  # cómo un plugin inyecta su look & feel (3 niveles, cascade layers)
logo/                       # kit: símbolo Grano, wordmark grano-i, lockups, app icon
proof/                      # battle-tests: admin, docs, blog, commerce, gallery, saas, themed
DESIGN.md                   # la constitución
HANDOFF.md                  # brief para retomar el trabajo (otra sesión/agente)
```

## Uso

```bash
npm i @milpa/design    # publicado en npm
```
```css
@import "@milpa/design/css";             /* tokens semánticos (dark-first) */
@import "@milpa/design/motion.css";      /* el viento + contrato reduced-motion */
@import "@milpa/design/primitives.css";  /* el grano: mui-btn, mui-input, … */
@import "@milpa/design/components.css";  /* el frijol: mui-card, mui-table, mui-shell, … */
@import "@milpa/design/artifacts.css";   /* el elote: mui-code, mui-chart, mui-prose, … */
@import "@milpa/design/layouts.css";     /* la parcela: mui-docs, mui-hero, mui-pricing, … */
```
```js
// tailwind.config.js
export { default } from "@milpa/design/tailwind";
```
El `<html>` **siempre** lleva `data-theme` (`"dark"` | `"light"`).

## Theming (plugins)

Todo el CSS publicado vive en `@layer milpa.*` — **tu CSS sin layer siempre gana**, sin
`!important`. Tres niveles: **retokenizar** (override de custom properties), **reskin** (tu CSS
reemplaza la piel de cualquier `mui-*`) o **reemplazo total** (traés tu design system y honrás
`theme.contract.json`). Validá tu skin: `npm run verify:theme -- mi-skin.css` (los mismos 193
pares AA del gate). Ejemplo vivo: `proof/themed.html`. Leé [`THEMING.md`](./THEMING.md).

## Desarrollo

```bash
npm run build      # genera dist/ desde tokens/milpa-tokens.json (cero dependencias)
npm test           # triple gate: contraste AA (193) + gobernanza del molde y las capas + drift de dist/ y theme.contract.json
npm run proof      # sirve el repo en http://localhost:4321 → /proof/milpa-admin-proof.html
```

Flujo de tokens: editar `tokens/milpa-tokens.json` → `npm run build` → `npm test`. Editar
`dist/` a mano no tiene sentido: CI falla si driftea del JSON.

## Licencia

[Apache-2.0](./LICENSE) — alineada con el core (VISION.md D10).
