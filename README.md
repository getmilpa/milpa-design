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

**v0 — paleta cerrada.** `oro` (primario) + `olivo` (secundario / la milpa viva) + `tierra`
(neutro); `cielo` = `info`. **32/32 pares WCAG AA** (dark + light). Aún sin build pipeline ni
primitivas implementadas → ver [`HANDOFF.md`](./HANDOFF.md).

## Estructura

```
tokens/milpa-tokens.json    # DTCG — FUENTE DE VERDAD
dist/                       # salidas consumibles (CSS vars + preset Tailwind)  [baseline hand-authored, verificado AA]
motion/                     # "el viento": easings + primitivas + contrato reduced-motion
primitives/                 # Button, Input (+ contratos) — pendiente (HANDOFF)
proof/                      # storybook v0: página de prueba visual
DESIGN.md                   # la constitución
HANDOFF.md                  # brief para retomar el trabajo (otra sesión/agente)
```

## Uso (destino)

```bash
npm i @milpa/design
```
```css
@import "@milpa/design/css";     /* tokens semánticos (dark-first) */
@import "@milpa/design/motion.css";
```
```js
// tailwind.config.js
export { default } from "@milpa/design/tailwind";
```
El `<html>` **siempre** lleva `data-theme` (`"dark"` | `"light"`).

## Desarrollo

```bash
npm install
npm run build      # style-dictionary: tokens/ -> dist/   (ver HANDOFF task 1)
npm test           # verifica contraste WCAG AA de todos los pares semánticos
npm run proof      # sirve proof/ en http://localhost:4321
```

## Licencia

[Apache-2.0](./LICENSE) — alineada con el core (VISION.md D10).
