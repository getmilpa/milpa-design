# HANDOFF — `@milpa/design`

> Brief para retomar el trabajo en una **sesión/agente aparte**, en paralelo al framework (repo
> `teamx`). Leé esto + [`DESIGN.md`](./DESIGN.md) y arrancás.

## 1. Qué es y por qué está separado

Este es el **design + motion system** de [Milpa](https://milpa.lat) (el framework PHP modular
IA-native, CLI `coa`). Vive en su **propio repo/paquete** (`@milpa/design`) porque tiene otra
cadencia y otro stack (Node / Style Dictionary / Storybook) que el core PHP. **Divergir para
converger:** el framework y el DS avanzan en paralelo y se reencuentran en una **versión publicada**.

**La costura es un contrato, no un acople.** El DS *publica* dos cosas estables y versionadas:
1. **Tokens** (`tokens/milpa-tokens.json`, DTCG) → salidas en `dist/`.
2. **Contratos de componente** (`primitives/*.contract.json`) — spec legible por máquina de cada pieza.

El framework *consume* `@milpa/design@x.y.z`. **Nadie edita los internals del otro**; se cambian
cosas vía bump semver + nota de compat. (Esto es Milpa aplicado a sí mismo: contract-first.)

## 2. Estado actual (v0.1)

✅ **Paleta cerrada y verificada.** `oro` (primario/marca) + `olivo` (secundario / la milpa viva,
OKLCH ~124°) + `tierra` (neutro); `cielo` = `info`. Dark-first. Tokens DTCG + salida CSS + preset
Tailwind + motion + `DESIGN.md` + `proof/milpa-ds-proof.html`.

✅ **T2 cumplido y extendido — base de componentes admin completa.** 29 piezas token-driven con
contrato: 14 primitivas en `primitives/milpa-primitives.css` (Button/Field/Input = **el molde**,
+ Textarea, Select, Checkbox, Radio, Switch, Badge, Kbd, Avatar, Spinner, Progress, Divider) y
18 componentes en `components/milpa-components.css` (Tooltip, Menu, Card, Stat, Empty, Skeleton,
Table, Pagination, Tabs, Breadcrumbs, Alert, Toast, Modal, Drawer + Shell/Sidebar/Topbar/PageHeader).
Convenciones del molde en el header de `milpa-primitives.css` (estados vía atributos ARIA;
auto-borde `-active` en fills; solo tokens semánticos). Gate ampliado: **135/135 AA** (`npm test`).
Battle-test: `proof/milpa-admin-proof.html` (dashboard completo, dark/light, teclado).

✅ **T4 cumplido — logo kit en `logo/`** (símbolo Grano, wordmark grano-i, lockups, app icon;
mono-oro verificado).

⚠️ **Falta:** build pipeline real (hoy `dist/` es hand-authored, verificado), CI (T3), Storybook
formal (T5 — el proof admin cubre v0), publish (T6), LICENSE texto completo (T7).

## 3. Cómo correr

```bash
npm install
npm test        # verifica contraste AA de todos los pares semánticos (falla si algo rompe)
npm run proof   # sirve proof/ en http://localhost:4321  (abrí milpa-ds-proof.html)
npm run build   # style-dictionary: tokens/ -> build/generated/   (ver T1)
```

## 4. Backlog priorizado (bite-size)

- ~~**T1 · Build pipeline.**~~ ✅ **Hecho — decisión: generador propio, Style Dictionary descartado.**
  `scripts/build-tokens.mjs` (cero dependencias, como los verificadores) genera
  `dist/milpa-tokens.css` + `dist/tailwind.config.js` desde el JSON con el manejo de temas
  exacto (`:root`+`[data-theme="dark"]` / `[data-theme="light"]`). Round-trip verificado contra el
  dist hand-authored: 0 tokens perdidos/cambiados. `npm test` ahora incluye el **drift gate**
  (`--check`): editar el JSON sin regenerar rompe CI. Flujo: editar `tokens/milpa-tokens.json` →
  `npm run build` → `npm test`. SD se revisita solo si aparecen salidas multi-plataforma
  (iOS/Android/Figma). De paso: `easing.linear` entró al JSON (estaba solo en el CSS).
- ~~**T2 · Primitivas (el par de referencia).**~~ ✅ **Hecho y extendido** — 29 componentes con
  contrato (ver §2). El molde vive en el header de `primitives/milpa-primitives.css`; los nuevos
  componentes siguen ese patrón + contrato + pares nuevos al gate.
- ~~**T3 · CI.**~~ ✅ **Hecho** — `.github/workflows/ci.yml` corre `npm test` en cada push/PR:
  contraste (135 AA) + `scripts/verify-governance.mjs` (token-purity, sin rampas/!important/z-index
  crudo/duraciones hardcodeadas, var() existentes, 32 contratos válidos y coherentes). El paso de
  build queda anotado para cuando T1 se decida.
- ~~**T4 · Logo kit.**~~ ✅ **Hecho** — en `logo/` (símbolo, wordmark, lockups, app icon; mono-oro).
- **T5 · Storybook** (o seguir extendiendo `proof/`) para estados exhaustivos por pieza. El
  `proof/milpa-admin-proof.html` ya battle-testea la composición completa.
- **T6 · Publish `@milpa/design@0.1.0`** al scope npm `@milpa` (reservado) cuando T2 esté.
- ~~**T7 · LICENSE**~~ ✅ **Hecho** — texto completo de Apache-2.0 (canónico) con copyright
  Rod Vince / TeamX (StudioWeb MX).
- ~~**T8 · Feedback del battle-test**~~ ✅ **Hecho:**
  1. `mui-stat__delta` desacoplado: `--up/--down` = solo dirección (flecha); `--positive/--negative`
     = valencia (color). "Tiempo de build −8s" ahora es `--down --positive` (baja Y mejora).
  2. Patrón "menú a nivel body posicionado por JS" documentado en `a11y.behavior` del contrato
     de table (el `overflow-x` del wrap clipea paneles internos).
  3. Snippet oficial del wordmark en `logo/README.txt` (+ regla en DESIGN §2): vector del kit,
     `i` sin punto, grano = `oro-300` constante — prohibidos los trucos tipográficos.

## 5. Reglas duras (no negociables)

- **Contraste AA** (4.5 texto / 3:1 UI), **paridad light/dark**, **paridad reduced-motion**,
  navegable por teclado con `:focus-visible`, `aria-*` correctos. (DESIGN §6 quality floor.)
- `<html>` **siempre** lleva `data-theme` (`"dark"|"light"`), nunca ausente.
- Naming: clases `mui-*`; tokens `--{categoría}-{nombre}`; contratos `{componente}.contract.json`.
- **El verde de marca (olivo ~124°) vive lejos de success (~150°)** — no los acerques.
- Cambiar la forma/semántica de un token o contrato = **bump semver** (el framework depende de esto).

## 6. Referencias cruzadas

- **Framework / plan maestro:** `VISION.md` en el repo `teamx` (`git.tuculon.com/.../teamx`,
  futuro `github.com/getmilpa`). Decisiones relevantes: **D6** (nombre Milpa), **D10** (licencia
  Apache-2.0), **D12** (CLI `coa`), **D13** (este repo/paquete es aparte, consumido por versión).
- **Destino público:** `github.com/getmilpa/milpa-design` · npm `@milpa/design` · `milpa.lat`.
- **Mood ref:** sistemas de identidad de infra-IA (Arcana): crema + olivo profundo + casi-negro.

## 7. Ojo / no hacer

- **No** toques identificadores del framework (namespace `Timored\Medusa\`, `php mds`, etc.) — son
  legacy a propósito hasta *Phase R* (rename atómico). El binario `coa` también es post-Phase R.
- **No** rompas el contrato de tokens/contratos sin bump semver.
- **No** conviertas el oro en fill primario sólido en light (queda ilegible; usá ghost).
