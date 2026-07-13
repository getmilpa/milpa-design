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

## 2. Estado actual (v0.8)

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

✅ **0.5.0 — la mano (T9 cluster D cumplido, los 7 items):** `mui-pager` standalone (extraído de
`mui-docs__pager` — grid de 2 columnas, cards silenciosas `border-subtle`→`border-strong`);
`mui-stack`/`mui-cluster` (piezas nuevas: ritmo vertical y agrupación que envuelve, sin color
propio, gap `space-2`/`space-4`/`space-6` por `--sm`/default/`--lg`); `mui-stat --lg` (solo el
valor sube a `text-4xl`); `mui-drawer --docked` (misma piel sobre `<aside>` estático — panel
persistente, NO modal: sin backdrop/foco-trap/Esc/`[open]`, contrato documenta `docked ≠ dialog`);
`mui-chart --line` + fila de ticks en HTML (`__ticks`/`__tick`, el `<text>` SVG se distorsiona
bajo el viewBox); `mui-footer` documenta `__mantra` como slot GENÉRICO de tagline de producto (no
hardcodeado a Milpa); `mui-media-gallery` documenta el swap de thumbs (click → cambia `__main` +
mueve `aria-current`, nombre accesible por tag) con el JS de referencia cableado en
`proof/commerce.html`. Contratos **65 → 68** (nuevos `mui-pager`/`mui-stack`/`mui-cluster`; el
resto — stat/drawer/chart/footer/media-gallery — son variantes/behaviors). Gate: **193/193 AA** —
audit de cierre: **0 pares nuevos** (todo reusa pares ya cubiertos: `accent-text`/`text-muted`
sobre `bg`/`surface`, `text`/`surface`, `--viz-*`).

✅ **0.6.0 — el deshierbe (backlog T9 cerrado: hallazgos F #8/#9/#10 + los 2 Minors):** el
off-canvas móvil de `mui-header` y `mui-docs` deja el panel `position:fixed` +
`[data-nav-open]` + scrim por un **`<dialog class="mui-drawer">`** (`--start` en docs) abierto
con `showModal()` — top layer nativo (focus trap/Esc/`::backdrop` gratis). Consecuencias: ya NO
hace falta `overflow-x:clip` en la raíz de la página (se removió de los **cuatro** proofs que lo
tenían —blog, commerce, gallery, saas—; `docs.html` nunca lo tuvo y se arregla vía el `<dialog>`,
que es el fondo de F#8); el menú móvil queda como elemento aparte con los links duplicados;
el buscador de commerce vuelve a vivir en móvil, duplicado dentro del drawer (F#9). Los media slots
pasan de combinador descendiente a **hijo** (`> :is(img, svg, picture)`) para que un `<picture>`
no dispare el hover-scale doble — en `mui-media-grid` el guard queda al nivel del `figure`/
`__figure` puente, hijo directo del bridge (F#10). Más los 2 Minors del
review de 0.3.0: guard de set vacío en el lightbox del gallery (`show(i)` corta si
`visibleItems()` es `[]`) y la política del guard `[hidden]` fijada en DESIGN §6 (aplica al
contenedor que un filtro togglea, no a los medios internos). De paso: badge SOC 2 de `saas.html`
unificado a `--accent`; `anatomy` documentada en `mui-stack`/`mui-cluster`. Variante nueva:
`mui-drawer --start` (anclada a la izquierda). Contratos **68 → 68** (sin cambio). Gate:
**193/193 AA** — audit de cierre: **0 pares nuevos**. **COMPAT (única de este release):** quien
consumía el off-canvas viejo migra el toggle de `[data-nav-open]` a `showModal()`/`close()` sobre
un `mui-drawer` y borra el scrim — ver nota destacada en `CHANGELOG.md`.

✅ **0.7.0 — la piel (theming release-grade para tipografía y dimensiones estructurales):** la
auditoría de personalización (32 hallazgos) había marcado que el theming era release-grade para
color/spacing/radios/motion/dark-light pero NO para tipografía ni para varias dimensiones
definitorias. Este release cierra esa brecha:
- **Split de fuentes** (`--font-heading`/`--font-body`, default = mismo stack que tenía
  `--font-display`) + **`--font-serif`** (prose/quotes, hereda body por default) +
  **`--weight-semibold`** (600). `--font-display` sobrevive como **alias vivo**
  (`var(--font-heading)`) — cero ruptura. Regla base `:is(h1..h6) → --font-heading` para que todo
  heading, tenga o no clase `.mui-*` propia, siga la fuente de títulos. ~45 sitios re-apuntados en
  los 4 bundles (títulos → heading, chrome de UI → body, prose/quotes → serif directo).
- **Carga de fuentes documentada** en `THEMING.md` (self-host `@font-face` + alternativa `<link>`;
  la degradación a `system-ui` es intencional, el paquete no envía archivos de fuente).
- **`verify-theme` gatea por FORMA los 7 grupos** del contrato (tipo + no-vacío), no solo color —
  el contrato distingue hard-gate (contraste AA) de form-gate y deja de sobre-declarar tokens que
  nunca verificaba de verdad. `dist/tailwind.config.js` (`fontFamily`) pasa a var-based.
- **Dimensiones estructurales → tokens públicos** (grupo `size`, 10 tokens, default = literal
  actual): `--focus-width`/`--focus-offset` (anillo de foco, 42 sitios), `--border-width` (~86
  sitios), `--container-max/narrow/wide` + `.mui-shell__main`, `--header-h`/`--sidebar-w`
  (incluida la sidebar off-canvas móvil) /`--drawer-width` del app-shell, `--measure` (ancho de
  lectura de prose).
- **Único cambio visual:** `.mui-api__desc`/`__deprecated-note` unifican su `70ch` a
  `var(--measure)` (65ch) — inconsistencia previa con `.mui-prose`, corregida.
- Contratos: **68 → 68** (sin cambio — release de tokens + gate, no piezas nuevas). Gate:
  **193/193 AA** — audit de cierre: **0 pares nuevos** (release sin color,
  `scripts/contrast-pairs.mjs` sin tocar).

Con esto, los huecos de theming que dejó la auditoría de personalización quedan **CERRADOS**:
split de fuentes (heading/body/serif), doc de carga de fuentes, gate por forma en `verify-theme`,
y las dimensiones estructurales (focus-ring, borde, container, app-shell, measure).

✅ **0.8.0 — el rocío (cierra los 3 huecos de theming de MARCA que reveló el proof
Milpa⇄Brutalist):** el proof de theme-swap (0.7.0) demostró que el reskin por tokens (L1) alcanza
para un cambio de marca dramático (color/tipografía/forma/elevación/motion), pero dejó 3 límites
honestos anotados — no eran deuda de 0.7, eran el temario de 0.8:
- **`--border-style`** (grupo `effect`, default `solid`): los ~83 bordes del bundle
  (`border: var(--border-width) solid var(--border-*)`) repuntan su literal a
  `var(--border-style)` — un skin puede pasar `dashed`/`double`/`none` sin L2.
- **`--surface-backdrop` + `--blur-sm/base/lg`** (grupo `effect`, default `none` / 2·4·10px):
  expuestos en `.mui-card`/`.mui-modal`/`.mui-drawer` (`backdrop-filter: var(--surface-backdrop)`)
  y en los blurs frosted existentes de header/topbar/drawer — un skin glass activa
  `backdrop-filter` real sin CSS estructural propio.
- **`verify-theme` compone superficies translúcidas sobre `--bg`:** parsea color con alpha
  (`#RRGGBBAA`/`rgba`) y hace alpha-blend contra `--bg` antes de medir contraste AA — el gate ya
  no se cuela con un `--surface` semitransparente, lo compone y mide el contraste *efectivo*.
  Invariante nueva: **`--bg` debe ser opaco** (referencia de composición).
- **Glass como 3er flavor** del proof de theme-swap (`proof/skins/glass-skin.css`), elegido a
  propósito porque ejercita los 3 huecos de arriba: `--surface`/`--surface-raised`/`--overlay`
  translúcidos + `--bg` opaco + `backdrop-filter` real, pasando `verify:theme` (fixture negativa
  `glass-broken-skin.css` prueba el caso en que la composición rompe AA y falla el gate).
- Contratos: **68 → 68** (sin cambio — release de tokens + gate). Gate: **193/193 AA** — audit de
  cierre: **0 pares nuevos** (release sin color, `scripts/contrast-pairs.mjs` `PAIRS` sin tocar;
  solo se agrega la invariante `--bg` opaco). Todo aditivo — cero cambio visual por defecto.

✅ **0.9.0 — el almácigo (primitivas didácticas):** la galería educativa de Milpa Academy
(repo hermano `academy/artifacts/`, 2026-07-09) re-inventó con prefijo `wb-*` cuatro patrones
repetibles de material didáctico — el sistema los adopta como piezas contratadas (mismo patrón
que 0.3.0 «la plaza»): **`mui-plot`** (parcela: `__core`/`__cell` con `__name`/`__contract`/
`__note`; estados `slot`/`germinating`/`sown`/`wilted` — olivo=vivo, oro=sembrado,
danger=marchito), **`mui-pipeline`** (`__track` + rail + `__marker` por custom prop privada
`--_pipeline-progress`; estados `idle`/`active`/`complete`/`denied`/`failed`/`skipped`;
`--vertical`), **`mui-gate`** (`__request`/`__decisions` compone mui-btn/`__outcome`
role=status/`__audit` role=log append-only con chips mui-badge; estados `pending`/`approved`/
`rejected`/`waived`/`self-denied` — el rechazo por construcción de la auto-aprobación, espejo
del orquestador), **`mui-replay`** (`__stream`/`__scrubber` estiliza `<input range>` NATIVO/
`__projection` role=status; `data-applied` + `aria-current="step"`). CERO JS publicado — el
comportamiento es del consumidor, documentado en `a11y.behavior` con lógica de referencia
testeada en `academy/artifacts/artifacts-core.js`. Guard `[hidden]` en las 4 raíces. Contratos
**68 → 72**. Gate: **193/193 AA** — audit de cierre: **0 pares nuevos** (todas las tintas
reusan pares de callout --tip/--version/--danger, badge y base). Battle-test interno:
`proof/almacigo.html` (las 4 en una historia: la parcela alimenta el pipeline, autorizar abre
la compuerta, el proceso se relee en el replay). **Cierre externo pendiente:** refactor de la
galería de academy para consumir las piezas (T6 del plan — vive en el repo academy).

⚠️ **Falta:** Storybook formal (T5 — los proofs cubren v0.9). Backlog T9 **cerrado** desde 0.6.0.
Los 3 huecos de theming de **marca** que 0.7 había dejado anotados (border-style, backdrop/blur
tematizable, gate con translucidez) quedan **CERRADOS en 0.8** (ver arriba). Quedan, a propósito,
como **futuro conocido** los ejes que NO son de marca — nunca prometidos para 0.8, son ejes
arquitectónicos aparte:
- **3er eje de tema** (high-contrast / brand-alt / `forced-colors` / `prefers-contrast`) — hoy
  vedado por la regla dura #3 (§5); necesitaría rework de contrato + verificador.
- **Single-source de breakpoints** (`@custom-media` o migrar a `@container`) — hoy cada archivo
  repite sus propios `@media` literales.
- **Eje de densidad** (`[data-density]` sobre `--space-*`).
- **RTL** como concern de contrato (hoy no se verifica dirección de escritura).

## 3. Cómo correr

```bash
npm install
npm test               # 193 AA + governance (molde + @layer brace-walk + 68 contratos) + drift
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
- ~~**T3 · CI.**~~ ✅ **Hecho** — `.github/workflows/ci.yml` corre `npm test` en cada push/PR: el
  gate completo (contraste AA + `scripts/verify-governance.mjs` token-purity — sin
  rampas/!important/z-index crudo/duraciones hardcodeadas, var() existentes, contratos válidos y
  coherentes — + `@layer` brace-walk + drift de `dist/` y `theme.contract.json`). El paso de
  build queda anotado para cuando T1 se decida.
- ~~**T4 · Logo kit.**~~ ✅ **Hecho** — en `logo/` (símbolo, wordmark, lockups, app icon; mono-oro).
- **T5 · Storybook** (o seguir extendiendo `proof/`) para estados exhaustivos por pieza. Los
  seis proofs de 0.2.0 ya battle-testean la composición completa por caso de uso.
- ~~**T9 · Backlog — lo que los battle-tests destaparon**~~ ✅ **CERRADO** (gaps reales reportados
  por los builders de los proofs, por frecuencia de dolor). Clusters A, B y E ejecutados en 0.3.0
  «la plaza»; C ejecutado en 0.4.0 «el trato»; D ejecutado en 0.5.0 «la mano»; los hallazgos F
  (#8/#9/#10) y los 2 Minors de 0.3 ejecutados en 0.6.0 «el deshierbe» (ver §2) — **backlog
  completo, nada pendiente:**
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
  6. ~~**D · Pager standalone** (hoy `mui-docs__pager` está atado al shell); `mui-stat --lg`;
     utilidad stack/cluster; drawer variante docked/inline (demos y paneles laterales estáticos);
     `mui-chart --line` con fila de ticks HTML (el `<text>` del SVG se distorsiona); slot de
     mantra propio en `mui-footer` para productos de terceros; swap JS de referencia para thumbs
     de `mui-media-gallery` (documentado, sin implementar en el proof).~~ ✅ **Hecho (D)**,
     0.5.0 — los 7 items: `mui-pager` extraído del shell docs; `mui-stack`/`mui-cluster` (piezas
     nuevas, sin color); `mui-stat --lg`; `mui-drawer --docked` (sobre `<aside>`, NO modal,
     `docked ≠ dialog` documentado en el contrato); `mui-chart --line` + `__ticks`/`__tick` HTML;
     `mui-footer__mantra` como slot genérico de tagline; swap de thumbs de `mui-media-gallery`
     con JS de referencia cableado en `proof/commerce.html`. Contratos **65 → 68** (nuevos
     `mui-pager`/`mui-stack`/`mui-cluster`). AA-pairs audit de cierre: **0 pares nuevos**.
  7. ~~Gate: endurecer el check de @layer en governance (hoy es substring — un brace-walk
     cazaría reglas que queden FUERA de la capa); el lightbox del proof gallery cicla piezas
     filtradas (counter "n / 12") — decidir si el contrato debe prescribir respetar el filtro.~~
     ✅ **Hecho (E)** — brace-walk en `scripts/layer-guard.mjs` (+ test propio en `npm test`) y el
     lightbox del gallery ya respeta el filtro activo, 0.3.0.
  8. ~~**F#8 · overflow horizontal del off-canvas también afecta al shell de docs.** El panel
     `position:fixed` fuera de pantalla (16rem) del off-canvas extendía el scroll horizontal del
     documento; el fix de `mui-header` (`overflow-x: clip` en la raíz) no cubría `docs.html`.~~ ✅
     **Hecho, 0.6.0** — el off-canvas de `mui-header` Y `mui-docs` pasó a un
     `<dialog class="mui-drawer">` (`--start` en docs) abierto con `showModal()`: top layer nativo,
     ya NO extiende el scroll del documento, así que `overflow-x:clip` se removió de los **cuatro**
     proofs que lo tenían (blog, commerce, gallery, saas); `docs.html` nunca lo tuvo (ese ERA F#8)
     y se arregla estructuralmente vía el `<dialog>`.
  9. ~~**F#9 · `mui-header` no tenía patrón para acciones que no caben en móvil.** El proof de
     commerce, al colapsar a off-canvas ≤880px, ocultaba el buscador junto con el badge del
     carrito y perdía la búsqueda en móvil sin sustituto.~~ ✅ **Hecho, 0.6.0** — el buscador de
     commerce se duplica dentro del `<dialog>` del menú móvil, junto a los links: lo que no cabe
     en la barra se muda, no se pierde.
  10. ~~**F#10 · combinador descendiente en los media slots compone hover scale con `<picture>`.**
      `:is(img, svg, picture)` usaba combinador descendiente: si el consumidor armaba
      `<picture><img></picture>`, el selector matchea AMBOS elementos y el hover-scale se aplicaba
      dos veces (≈1.061 en vez de ≈1.03).~~ ✅ **Hecho, 0.6.0** — combinador **hijo** (`>`) en los
      cuatro slots; en `mui-media-grid` el guard vive al nivel del `figure`/`__figure` puente
      (hijo directo del bridge, no del `__item`).
  11. ~~**Minors diferidos (triage del review final 0.3.0).** (a) `.mui-card__media >
      :is(img, svg, picture)` sin guard `[hidden]` — pendiente decisión de política. (b)
      `proof/gallery.html` `show(i)` sin guard contra un set visible vacío.~~ ✅ **Hecho, 0.6.0** —
      (a) DESIGN §6 fija la política: el guard `[hidden]` aplica al contenedor que un filtro
      togglea, NO a los medios internos (que nunca son ellos mismos el objetivo del toggle); sin
      cambio de código. (b) `show(i)` corta con `if (!items.length) return;` si `visibleItems()`
      es `[]`.
- ~~**T6 · Publish `@milpa/design@0.1.0`**~~ ✅ **PUBLICADO** (2026-07-02T05:00Z, por
  `teamx-devkit`): `npm i @milpa/design` — 59 archivos, 88 kB, los 8 exports verificados con
  install real. Flujo de release: `npm run release` (token en `.env` gitignoreado +
  `.npmrc.publish` vía `--userconfig`; `prepublishOnly` corre el triple gate). OJO histórico: un
  `.npmrc` de proyecto con `${NPM_TOKEN}` sin definir rompe TODOS los comandos npm (por eso el
  archivo aparte); con 2FA activo el publish pide `--otp` (o usar token Automation/granular). A
  futuro: trusted publishing OIDC desde GitHub Actions cuando el repo viva en `github.com/getmilpa`.
  Nota 0.1.1: agregar `"./package.json": "./package.json"` a exports (compat con tooling).
- ~~**T7 · LICENSE**~~ ✅ **Hecho** — texto completo de Apache-2.0 (canónico) con copyright
  Rodrigo Vicente Gómez / TeamX Agency (actualizado 2026-07-09: línea editorial — el creador
  firma con su nombre real; StudioWeb era la agencia anterior, ya no aparece).
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
- **La regla de entrada (DESIGN §6):** nada entra por verse bien — caso real, ≥2 apariciones (o
  alta probabilidad), describible con contrato, pasa gates, consumible del paquete sin hacks.
  Los consumidores (Academy incluida) inventan con prefijo propio; el DS decide qué sobrevive.

## 6. Referencias cruzadas

- **Framework / plan maestro:** `VISION.md` en el repo `teamx` (`git.tuculon.com/.../teamx`,
  futuro `github.com/getmilpa`). Decisiones relevantes: **D6** (nombre Milpa), **D10** (licencia
  Apache-2.0), **D12** (CLI `coa`), **D13** (este repo/paquete es aparte, consumido por versión).
- **Destino público:** `github.com/getmilpa/milpa-design` · npm `@milpa/design` · `milpa.lat`.
- **Mood ref:** sistemas de identidad de infra-IA (Arcana): crema + olivo profundo + casi-negro.

## 7. Ojo / no hacer

- **No** toques identificadores del framework (namespace `Milpa\`, binario `coa`) — se consumen tal cual; cualquier rename es decisión del framework, no de este repo.
  legacy a propósito hasta *Phase R* (rename atómico). El binario `coa` también es post-Phase R.
- **No** rompas el contrato de tokens/contratos sin bump semver.
- **No** conviertas el oro en fill primario sólido en light (queda ilegible; usá ghost).
