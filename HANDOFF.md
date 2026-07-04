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

## 2. Estado actual (v0.4)

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

✅ **0.2.0 — la segunda cosecha (plan `docs/superpowers/plans/2026-07-02-…-theming.md`):**
docs versionadas (kit + `mui-docs` shell), `artifacts/` (*el elote*, 15 piezas: code/terminal/
chart/prose/api/search/…), `layouts/` (*la parcela*, 11: hero/pricing/faq/footer/media/lightbox),
commerce en `components/` (5), tokens `--syntax-*`/`--viz-*`, y el **contrato de theming**:
todo el CSS en `@layer milpa.*` + `theme.contract.json` generado + `THEMING.md` +
`verify-theme.mjs`. Gate: **193/193 AA · 63 contratos**. Seis proofs (docs/blog/commerce/
gallery/saas/themed — el skin "Nopal" pasa el gate sin tocar bundles). Landing en inglés.

✅ **0.3.0 — la plaza (T9 cumplido, backlog A/B/E):** el header público **`mui-header`** (barra +
off-canvas + variante overlay — el tercer header, junto a `mui-topbar` admin y `mui-docs__topbar`
docs), adoptado en landing/blog/saas/gallery/commerce (landing usa `--overlay`; blog/saas/gallery
retiran sus headers bespoke; commerce deja de usar mal el `mui-topbar` admin); contenido/media
(`mui-card__media` cover edge-to-edge —pieza nueva, nace con `:is()`—, `mui-byline` avatar+nombre+meta
reusando `mui-avatar`); los cuatro media slots existentes se ensanchan de `img`-only a
`:is(img, svg, picture)` (product-card/media-gallery/media-grid/lightbox); el gate `@layer` pasa
de substring a **brace-walk** (`scripts/layer-guard.mjs` + test propio en `npm test`); el lightbox
del gallery **respeta el filtro activo** (contador n/filtrados). Gate: **193/193 AA · 65
contratos**. AA-pairs audit de cierre: **0 pares nuevos** — mui-header/mui-byline reusan
`text`/`text-muted` sobre `bg`/`surface`, ya cubiertos.

✅ **0.4.0 — el trato (T9 cluster C cumplido):** `mui-input-group--stepper` (número ± segmentado;
el grupo lleva el borde/foco, el input va borderless, los botones `.mui-input-group__step` se
deshabilitan `[disabled]` en los límites) — el PDP y el cart-line de commerce lo adoptan, dejando
de reimplementar su propio control de cantidad. `mui-tabs--pill` (variante visual: seleccionada
= `accent-subtle`/`accent-text`, el fill es el indicador) más el **patrón de filtro de panel
único** documentado en el contrato de tabs (todas las tabs de un tablist → una región
`tabpanel`, filtro vía `[hidden]`, roving tabindex) — el gallery lo estrena para filtrar
categorías. Ambas piezas son **variantes**, no piezas nuevas: contratos siguen en **65**. Gate:
**193/193 AA** — audit de cierre: **0 pares nuevos** (el stepper reusa `text`/`text-secondary`
sobre `bg`/`surface`; la pill seleccionada reusa `accent-text`/`accent-subtle`).

⚠️ **Falta:** Storybook formal (T5 — los proofs cubren v0.4). Backlog abajo (§4): cluster D y los
hallazgos F (#8/#9/#10) siguen abiertos.

## 3. Cómo correr

```bash
npm install
npm test               # 193 AA + governance (molde + @layer brace-walk + 65 contratos) + drift
npm run proof          # sirve el repo en http://localhost:4321 (proof/*.html, landing/)
npm run build          # genera dist/ + theme.contract.json desde tokens/milpa-tokens.json
npm run verify:theme -- mi-skin.css   # valida un skin contra theme.contract.json
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
- **T5 · Storybook** (o seguir extendiendo `proof/`) para estados exhaustivos por pieza. Los
  seis proofs de 0.2.0 ya battle-testean la composición completa por caso de uso.
- **T9 · Backlog — lo que los battle-tests destaparon** (gaps reales reportados por los
  builders de los proofs, por frecuencia de dolor). **Clusters A, B y E ejecutados en 0.3.0 «la
  plaza»; C ejecutado en 0.4.0 «el trato» (ver §2); D queda abierto:**
  1. ~~**Header de marketing/sitio** compartido (hoy landing, blog, saas y commerce lo
     re-escriben; `mui-topbar` es del shell admin y `mui-docs__topbar` del shell docs).~~ ✅
     **Hecho (A) — `mui-header`**, 0.3.0.
  2. ~~`mui-card__media` (cover edge-to-edge en cards) y `mui-byline` (avatar+nombre+fecha ×3
     usos).~~ ✅ **Hecho (B)**, 0.3.0.
  3. ~~Media slots como `:is(img, svg, picture)` en product-card/media-gallery/media-grid/
     lightbox (hoy `img`-only; los SVG token-driven necesitan plomería del consumidor).~~ ✅
     **Hecho (B)**: ensanchados de `img`-only a `:is(img, svg, picture)` los cuatro slots
     existentes — product-card/media-gallery/media-grid/lightbox — en 0.3.0. (`mui-card__media` es
     pieza NUEVA de esta versión y nace con `:is()` de fábrica, no es un slot "ensanchado".)
     `mui-hero__media` y `mui-cart-line__media` quedan `img`-only a propósito (ver hallazgo nuevo
     #10 abajo).
  4. ~~**Qty stepper extraíble** (`mui-input-group--stepper`) — hoy vive solo en cart-line.~~ ✅
     **Hecho (C)**, 0.4.0 — el grupo lleva el borde/foco, el input va borderless, los botones
     `.mui-input-group__step` se deshabilitan en los límites; el PDP y el cart-line de commerce
     lo adoptan.
  5. ~~**`mui-tabs` variante pill/filtro** (con su patrón ARIA de panel único documentado).~~ ✅
     **Hecho (C)**, 0.4.0 — `mui-tabs--pill` (seleccionada = `accent-subtle`/`accent-text`, el
     fill es el indicador) + el patrón de filtro de panel único en `a11y.behavior` del contrato
     (todas las tabs de un tablist → una región `tabpanel` vía `aria-controls`, filtro vía
     `[hidden]`, roving tabindex); el gallery lo estrena.
  6. **D · abierto.** Pager standalone (hoy `mui-docs__pager` está atado al shell); `mui-stat
     --lg`; utilidad stack/cluster; drawer variante docked/inline (demos y paneles laterales
     estáticos); `mui-chart --line` con fila de ticks HTML (el `<text>` del SVG se distorsiona);
     slot de mantra propio en `mui-footer` para productos de terceros; swap JS de referencia
     para thumbs de `mui-media-gallery` (documentado, sin implementar en el proof).
  7. ~~Gate: endurecer el check de @layer en governance (hoy es substring — un brace-walk
     cazaría reglas que queden FUERA de la capa); el lightbox del proof gallery cicla piezas
     filtradas (counter "n / 12") — decidir si el contrato debe prescribir respetar el filtro.~~
     ✅ **Hecho (E)** — brace-walk en `scripts/layer-guard.mjs` (+ test propio en `npm test`) y el
     lightbox del gallery ya respeta el filtro activo, 0.3.0.
  8. **Nuevo (descubierto en 0.3, F · abierto) — overflow horizontal del off-canvas también afecta al
     shell de docs.** El panel `position:fixed` fuera de pantalla (16rem) del off-canvas extiende
     el scroll horizontal del documento; el fix de `mui-header` (`overflow-x: clip` en la raíz de
     la página, aplicado en los proofs migrados) **no cubre `docs.html`** — su shell tiene el mismo
     patrón de off-canvas y mide ~208px de overflow @móvil sin el clip. Arreglar el shell de docs
     Y evaluar reemplazar el patrón por un `<dialog>` (top layer nativo, no extiende el scroll del
     documento) para que el consumidor no tenga que acordarse del `overflow-x:clip`.
  9. **Nuevo (descubierto en 0.3, F · abierto) — `mui-header` no tiene patrón para acciones que no
     caben en móvil.** El proof de commerce, al colapsar a off-canvas ≤880px, oculta el buscador
     junto con el badge del carrito y **pierde la búsqueda en móvil sin sustituto** (queda
     documentado como "honesto" en el proof, no resuelto). Evaluar un toggle de ícono de búsqueda
     (expande un input inline) o mover el buscador adentro del panel off-canvas como slot propio
     del contrato.
  10. **Nuevo (descubierto en 0.3, F · abierto) — combinador descendiente en los media slots compone
      hover scale con `<picture>`.** `:is(img, svg, picture)` usa combinador **descendiente**: si
      el consumidor arma `<picture><img></picture>`, el selector matchea AMBOS elementos y el
      hover-scale se aplica dos veces (≈1.061 en vez de ≈1.03). Bug **latente** — ningún proof usa
      `<picture>` hoy, así que no se disparó en 0.3. Fix futuro: combinador **hijo** (`>`) donde el
      slot pueda envolver un `<picture>`.
  11. **Minors diferidos (triage del review final 0.3.0), abiertos.** (a) `.mui-card__media >
      :is(img, svg, picture)` no lleva el guard `[hidden]` (`display:block` sin excepción) que
      viola la regla dura de la casa (precedente ea72ac3: el display del autor no debe pisar al
      UA) — pendiente decisión de política: guardar TODOS los media inner o solo los que
      togglean `hidden`. (b) `proof/gallery.html` `show(i)` no guarda contra un set visible
      vacío (si `visibleItems()` fuera `[]`, `idx=NaN` → `items[NaN]` undefined) — inalcanzable
      hoy (los 4 tabs tienen ≥3 ítems); fix de una línea (`if (!items.length) return;`).
- ~~**T6 · Publish `@milpa/design@0.1.0`**~~ ✅ **PUBLICADO** (2026-07-02T05:00Z, por
  `teamx-devkit`): `npm i @milpa/design` — 59 archivos, 88 kB, los 8 exports verificados con
  install real. Flujo de release: `npm run release` (token en `.env` gitignoreado +
  `.npmrc.publish` vía `--userconfig`; `prepublishOnly` corre el triple gate). OJO histórico: un
  `.npmrc` de proyecto con `${NPM_TOKEN}` sin definir rompe TODOS los comandos npm (por eso el
  archivo aparte); con 2FA activo el publish pide `--otp` (o usar token Automation/granular). A
  futuro: trusted publishing OIDC desde GitHub Actions cuando el repo viva en `github.com/getmilpa`.
  Nota 0.1.1: agregar `"./package.json": "./package.json"` a exports (compat con tooling).
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
- **Todo CSS publicado declara el orden `@layer` canónico y envuelve sus reglas en su capa**
  (governance lo verifica; el orden vive en `scripts/contrast-pairs.mjs` → `LAYER_ORDER`). El
  CSS sin layer del consumidor SIEMPRE gana — no "arregles" eso, es el mecanismo de theming.
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
