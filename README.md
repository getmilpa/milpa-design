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

**v0.1 — base de componentes admin completa.** Paleta cerrada: `oro` (primario) + `olivo`
(secundario / la milpa viva) + `tierra` (neutro); `cielo` = `info`. **135/135 pares WCAG AA**
(dark + light, `npm test`). **29 componentes** con contrato: 11 primitivas (Button, Input, Field,
Textarea, Select, Checkbox, Radio, Switch, Badge, Kbd, Avatar, Spinner, Progress, Divider…) +
componentes admin (Card, Stat, Table, Pagination, Tabs, Breadcrumbs, Menu, Tooltip, Alert, Toast,
Modal, Drawer, EmptyState, Skeleton, Shell/Sidebar/Topbar/PageHeader). Pendiente: build pipeline
SD, CI, publish → ver [`HANDOFF.md`](./HANDOFF.md).

## Estructura

```
tokens/milpa-tokens.json    # DTCG — FUENTE DE VERDAD
dist/                       # salidas consumibles (CSS vars + preset Tailwind)  [baseline hand-authored, verificado AA]
motion/                     # "el viento": easings + primitivas + contrato reduced-motion
primitives/                 # el grano: Button, Input, Field, controles… (+ *.contract.json)
components/                 # el frijol: Card, Table, Modal, Shell admin… (+ *.contract.json)
logo/                       # kit: símbolo Grano, wordmark grano-i, lockups, app icon
proof/                      # storybook v0: prueba visual de tokens + panel admin completo
DESIGN.md                   # la constitución
HANDOFF.md                  # brief para retomar el trabajo (otra sesión/agente)
```

## Uso (destino)

```bash
npm i @milpa/design
```
```css
@import "@milpa/design/css";             /* tokens semánticos (dark-first) */
@import "@milpa/design/motion.css";      /* el viento + contrato reduced-motion */
@import "@milpa/design/primitives.css";  /* el grano: mui-btn, mui-input, … */
@import "@milpa/design/components.css";  /* el frijol: mui-card, mui-table, mui-shell, … */
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
npm run proof      # sirve el repo en http://localhost:4321 → /proof/milpa-admin-proof.html
```

## Licencia

[Apache-2.0](./LICENSE) — alineada con el core (VISION.md D10).
