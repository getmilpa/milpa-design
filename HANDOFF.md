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

- **T1 · Build pipeline.** Decidir: ¿`dist/milpa-tokens.css` sigue **hand-authored** (simple, ya
  verificado) o lo **genera Style Dictionary** con manejo de temas (`:root`/`[data-theme=light]`)?
  SD por defecto aplana `theme.dark.*` → custom needed. Empezá por `style-dictionary.config.mjs`
  (hoy escribe a `build/generated/`, no pisa el `dist/` verificado). **No rompas `npm test`.**
- ~~**T2 · Primitivas (el par de referencia).**~~ ✅ **Hecho y extendido** — 29 componentes con
  contrato (ver §2). El molde vive en el header de `primitives/milpa-primitives.css`; los nuevos
  componentes siguen ese patrón + contrato + pares nuevos al gate.
- **T3 · CI.** GitHub Action que corra `npm test` (el verificador de contraste) + build en cada PR.
- ~~**T4 · Logo kit.**~~ ✅ **Hecho** — en `logo/` (símbolo, wordmark, lockups, app icon; mono-oro).
- **T5 · Storybook** (o seguir extendiendo `proof/`) para estados exhaustivos por pieza. El
  `proof/milpa-admin-proof.html` ya battle-testea la composición completa.
- **T6 · Publish `@milpa/design@0.1.0`** al scope npm `@milpa` (reservado) cuando T2 esté.
- **T7 · LICENSE** → reemplazar por el texto completo de Apache-2.0 antes de público.
- **T8 · Feedback del battle-test** (`proof/milpa-admin-proof.html` los expuso; chicos):
  1. `.mui-stat__delta` acopla dirección y valencia (`--up`=success, `--down`=danger). "Tiempo de
     build −8s" es *baja = mejora* → desacoplar (p.ej. modificador `--positive/--negative` aparte
     de la flecha) o documentar el patrón neutro + `.mui-sr-only`.
  2. `.mui-menu` dentro de `.mui-table-wrap` se clipea por el `overflow-x` — documentar en el
     contrato de table el patrón "menú a nivel body posicionado por JS" que ya usa el proof.
  3. El **grano-dot** del wordmark (punto de la `i`) se replica a mano en cada proof — candidato a
     primitiva `mui-grano-dot` o a snippet oficial en el contrato de marca.

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

- **No** toques identificadores del framework (namespace `Milpa\`, `php coa`, etc.) — son
  legacy a propósito hasta *Phase R* (rename atómico). El binario `coa` también es post-Phase R.
- **No** rompas el contrato de tokens/contratos sin bump semver.
- **No** conviertas el oro en fill primario sólido en light (queda ilegible; usá ghost).
