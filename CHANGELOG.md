# Changelog — @milpa/design

Formato: [Keep a Changelog](https://keepachangelog.com/) · SemVer.

## [Unreleased]

## [0.7.0] — 2026-07-04

> **La piel:** el theming pasa de release-grade en color/spacing/radios/motion/dark-light a
> release-grade también en tipografía y dimensiones estructurales — la brecha que dejó la
> auditoría de personalización (32 hallazgos). Split `--font-heading`/`--font-body` (+
> `--font-serif`), `--weight-semibold`, y un grupo `size` de diez tokens públicos (focus-ring,
> borde, container, app-shell, measure) reemplazan literales hardcodeados en los cuatro bundles.
> `verify-theme` deja de gatear solo color y valida los 7 grupos del contrato por FORMA. Todo
> aditivo — cada token nuevo defaultea a su valor actual, así que el build por defecto es
> pixel-idéntico salvo un ajuste deliberado de 70ch→65ch en dos bloques de prose (ver Fixed).
> Sin piezas nuevas: **68 piezas** con contrato · **193 pares AA** — audit de cierre: **0 pares
> nuevos** (release sin color).

### Added
- **`--font-heading` / `--font-body`** — el split 2-tier que reemplaza el `--font-display`
  único: ambos defaultean al mismo stack que tenía `--font-display` (`'Space Grotesk',
  system-ui, sans-serif`), así que nada cambia visualmente hasta que un consumidor los diverja.
  **`--font-display` queda vivo como alias** (`var(--font-heading)`) — nadie que lo consuma hoy
  se rompe. Se agrega además una **regla base `:is(h1, h2, h3, h4, h5, h6) { font-family:
  var(--font-heading) }`**, así que CUALQUIER heading —incluidos los que nunca tuvieron una
  regla `.mui-*` propia— hereda la fuente de títulos por default, no solo los `.mui-*__title`
  explícitos.
- **`--font-serif`** — fuente de prose/quotes (`.mui-prose`, `.mui-quote`, `blockquote`);
  defaultea a `var(--font-body)` (hereda cuerpo → cero cambio hasta que el consumidor lo setee
  aparte, p.ej. un serif editorial para long-form).
- **`--weight-semibold`** (600) — completa la escala 400/500/**600**/700; superficie nueva, no
  hardcodeada por ningún selector todavía.
- **Grupo `size` de tokens públicos** (diez, todos defaulteando al literal que reemplazan):
  `--focus-width` (2px) / `--focus-offset` (2px) para el anillo de foco; `--border-width` (1px);
  `--container-max` (72rem) / `--container-narrow` (48rem) / `--container-wide` (90rem);
  `--header-h` (3.5rem) / `--sidebar-w` (16rem) / `--drawer-width` (26rem) del app-shell; y
  `--measure` (65ch) para el ancho de lectura de prose.
- **Doc de carga de fuentes en `THEMING.md`** (nueva sección): snippet self-host `@font-face`
  para Space Grotesk/Space Mono + alternativa `<link>` a un servicio, y nota explícita de que la
  degradación a `system-ui` es **intencional** — el paquete no envía archivos de fuente ni
  depende de un CDN. También documenta el split heading/body/serif con ejemplo de override.

### Changed
- **`verify-theme` ahora valida los 7 grupos del contrato por FORMA** (tipo + no-vacío) para
  cualquier token no-color que un skin setee — no solo color como hasta 0.6.0. El contrato pasa a
  distinguir **hard-gate** (contraste AA, sigue siendo el único que bloquea sobre color) de
  **form-gate** (longitud/número/tiempo/timing-function/box-shadow válidos para el resto de los
  grupos) y deja de sobre-declarar tokens que nunca gateaba de verdad.
- **`dist/tailwind.config.js` (generado): `fontFamily` pasa a var-based** —
  `heading`/`body`/`serif`/`mono` (+ `display` como alias de `heading`) en vez de los literales
  `display`/`mono` de antes — themeable desde Tailwind también, no solo desde CSS puro.
- **Los cuatro bundles (`primitives`/`components`/`artifacts`/`layouts`) repuntan sus literales**
  a los tokens nuevos: los ~45 sitios que usaban `var(--font-display)` se reclasifican a
  `--font-heading` (títulos: `.mui-*__title`, `mui-card__title`, `mui-stat__value`, wordmark…) o
  `--font-body` (todo el resto de chrome de UI: botones, inputs, nav, tabs, tabla, tooltips…),
  más `.mui-prose`/`.mui-quote`/`blockquote` directo a `--font-serif`; el anillo de foco
  (`outline: 2px solid var(--focus)` → `var(--focus-width)`, `outline-offset` → `var(--focus-offset)`
  con signo preservado en los offsets negativos) en 42 sitios; ~86 sitios de `border: 1px` →
  `var(--border-width)`; `.mui-container`/`--narrow`/`--wide` y `.mui-shell__main` →
  `var(--container-max/narrow/wide)`; el app-shell (`--_sidebar-w`/`--_topbar-h`, incluida la
  sidebar off-canvas ≤960px) → `var(--sidebar-w)`/`var(--header-h)`, y `.mui-drawer` →
  `var(--drawer-width)`; `aspect-ratio` de product-card/media-grid reusa `--media-ratio`
  (fallback-local, no promovido a token JSON) con su valor default intacto (4/5, 4/3).
- **Alcance del release —** contratos siguen en **68** (esto es tokens + gate, no piezas nuevas);
  auditoría de pares AA de cierre: **0 pares nuevos** (release sin color), `scripts/contrast-pairs.mjs`
  queda sin tocar.
- **COMPAT —** ninguna ruptura: `--font-display` sigue resolviendo (alias vivo a
  `--font-heading`) y cualquier skin/consumidor que lo seteaba directo sigue funcionando igual;
  quien quiera títulos distintos del cuerpo ahora setea `--font-heading`/`--font-body` por
  separado. El paquete **no** envía archivos de fuente — degrada a `system-ui` a propósito (ver
  `THEMING.md`).

### Fixed
- **Ancho de lectura de prose unificado a `--measure` (65ch)**: `.mui-api__desc` y
  `.mui-api__deprecated-note` usaban `70ch`, inconsistente con `.mui-prose` (`65ch`) pese a ser el
  mismo tipo de bloque de prose (mismo `text-sm`/`leading-normal`/`text-secondary`). Los tres
  ahora leen `var(--measure)` — **el único cambio visual del release**, un angostamiento de 5ch en
  esos dos sitios; todo lo demás del release es **cero cambio visual por defecto** (cada token
  nuevo defaultea a su valor hardcodeado actual).

## [0.6.0] — 2026-07-04

> **El deshierbe:** cierre del backlog T9 abierto desde 0.3 — los tres hallazgos F (#8/#9/#10) y
> los Minors diferidos del review final de 0.3.0. El off-canvas móvil de `mui-header` y `mui-docs`
> cambia de mecanismo (panel `position:fixed` → `<dialog class="mui-drawer">` nativo, top layer) —
> el único cambio de comportamiento del release, con nota de compat destacada abajo. Sin piezas
> nuevas de peso (`mui-drawer--start` es variante): **68 piezas** con contrato · **193 pares AA** —
> audit de cierre: **0 pares nuevos**.

### Added
- **`mui-drawer--start`** — variante de `mui-drawer` anclada al inline-start (izquierda): mismo
  contrato de foco/teclado que el default (`--end`), ancla/borde/animación de entrada espejados.
  La usa el shell `mui-docs` para su menú móvil ≤880px.

### Changed
- **El off-canvas móvil de `mui-header` y `mui-docs` pasa de un panel `position:fixed` +
  `[data-nav-open]` (+ scrim) a un `<dialog class="mui-drawer">` (`--start` en docs) abierto con
  `.showModal()`** — top layer nativo: focus trap, Esc y `::backdrop` los da el navegador, ya no
  hay que reimplementarlos a mano. Consecuencias:
  1. **Ya NO hace falta `html,body { overflow-x: clip }`** en la raíz de la página — se removió de
     los **cuatro** proofs que lo tenían (blog, commerce, gallery, saas), y `docs.html` —que nunca
     lo tuvo— deja de overflowear gracias al `<dialog>` (top layer), que es justo el fondo del
     hallazgo F#8: el clip de `mui-header` nunca cubrió el shell de docs.
  2. **El menú móvil es un elemento APARTE:** un `<dialog>` hermano del header/shell (no una
     transformación del nav inline) con el mismo árbol de links duplicado — el patrón estándar de
     "mobile menu".
  3. **COMPAT — quien consumía el off-canvas viejo migra así:** el toggle deja de alternar
     `[data-nav-open]` en el root y pasa a llamar `dialog.showModal()` / `dialog.close()` sobre un
     `mui-drawer`; el scrim y el atributo `[data-nav-open]` se borran — ya no existen, el backdrop
     nativo del `<dialog>` los reemplaza.
- **El buscador de commerce vuelve a estar disponible en móvil (F#9):** antes se ocultaba junto al
  nav ≤880px sin sustituto (documentado como "honesto" pero sin resolver); ahora vive duplicado
  dentro del `<dialog>` del menú móvil, junto a los links — lo que no cabe en la barra se muda, no
  se pierde.
- Badge SOC 2 de `saas.html` unificado a `--accent` (antes `--secondary` en un ejemplo) —
  consistencia visual, mismo par ya gateado. Contratos de `mui-stack`/`mui-cluster` documentan su
  `anatomy` (root).
- **DESIGN §6 fija la política del guard `[hidden]`:** aplica al contenedor que un filtro
  oculta/muestra (p.ej. `.mui-media-grid__item[hidden]`), NO a los medios internos
  (`mui-card__media`, slots `:is(img, svg, picture)`) — resuelve la pregunta de política abierta
  del review de 0.3.0, sin cambio de código.
- Contratos: **68 → 68** (sin cambio — `mui-drawer--start` es variante, no pieza nueva).
- AA-pairs audit de cierre: **0 pares nuevos** — el drawer reusa sus propios pares desde 0.1.0; los
  links del menú móvil son `mui-btn`/`mui-stack` ya gateados; los cambios de media-slot son solo de
  combinador (sin color); el badge SOC 2 reusa `accent-text`/`accent-subtle`. `scripts/contrast-pairs.mjs`
  queda **sin tocar**.

### Fixed
- **Media slots usan combinador HIJO** (`> :is(img, svg, picture)`) en vez de descendiente: un
  `<picture><img></picture>` ya no matchea ambos elementos y compone el hover-scale dos veces
  (≈1.061 en vez de ≈1.03) — F#10. En `mui-media-grid` el guard queda al nivel del `figure`/
  `__figure` puente (hijo directo del bridge), no del `__item`.
- **Guard de set vacío en el lightbox del gallery** (`proof/gallery.html`): `show(i)` corta si
  `visibleItems()` devuelve `[]` en vez de indexar `items[NaN]` (Minor diferido de 0.3.0).

Backlog T9 **cerrado**: los cinco clusters (A–E, 0.3.0–0.5.0) más los hallazgos F (#8/#9/#10) y los
dos Minors del review de 0.3.0 quedan resueltos. Solo queda lo genuinamente futuro (§4 del HANDOFF:
Storybook T5, salidas multiplataforma).

## [0.5.0] — 2026-07-04

> **La mano:** el cluster D del battle-test 0.3 — siete piezas de pulido reportadas por los
> proofs, sin gaps nuevos. Tres piezas nuevas (`mui-pager`, `mui-stack`, `mui-cluster`) y el
> resto variantes/behaviors sobre contratos existentes: **68 piezas** con contrato · **193 pares
> AA** — audit de cierre: **0 pares nuevos**.

### Added
- **`mui-pager`** — navegación prev/next entre páginas hermanas (docs, blog, cualquier
  secuencia), extraída como pieza standalone del shell docs (`mui-docs__pager`) para que
  cualquier consumidor la reuse: grid de 2 columnas, cards silenciosas (`border-subtle` →
  `border-strong` al hover), sin `prev` el `--next` se ancla solo a la columna 2.
- **`mui-stack`** / **`mui-cluster`** — utilidades de ritmo y agrupación, puro layout (sin fondo,
  sin borde, sin semántica propia): `mui-stack` apila en columna con gap consistente (reemplazo
  del `margin-block` ad-hoc entre piezas de un grupo chico); `mui-cluster` arma una fila que
  ENVUELVE (badges, botones, tags) con gap + alineación centrada. Mismo patrón de tamaño en
  ambas: `--sm`/`--lg` mueven el gap a `space-2`/`space-6` (default `space-4`).
- **`mui-stat --lg`** — variante hero-stat: solo el valor sube de escala (`text-4xl`), para KPIs
  destacados fuera de una grilla densa.
- **`mui-drawer --docked`** — la misma piel del drawer (borde inline-start, header/body/footer)
  montada sobre un `<aside>` estático en vez de un `<dialog>`: panel lateral **persistente**, NO
  modal — sin backdrop, sin foco-trap, sin Esc, sin `[open]`. El contrato documenta la línea
  dura `docked ≠ dialog` para que nadie intente cerrarlo/abrirlo dinámicamente (eso vuelve a ser
  el patrón modal).
- **`mui-chart --line`** + fila de ticks en HTML — trazo de serie temporal vía `<polyline>`/`<path>`
  con `--viz-1..6`; los ticks del eje X se resuelven como `.mui-chart__ticks`/`__tick` en HTML
  (mono, `text-muted`) en vez de `<text>` SVG, porque el `<text>` se distorsiona al escalar bajo
  el `viewBox`.

### Changed
- **El shell docs compone `mui-pager`** en vez de tener su propio idiom (`mui-docs__pager`
  queda como el wrapper de margen; el pager en sí es la pieza compartida).
- **El contrato de `mui-footer` documenta `__mantra` como slot GENÉRICO de tagline de producto**
  (no hardcodeado a Milpa): cualquier consumidor lo llena con el suyo, en su propio idioma —
  Milpa pone "Siembra módulos, cosecha aplicaciones."; un tercero (ej. `proof/saas.html`, Troje)
  pone el suyo en inglés.
- **El contrato de `mui-media-gallery` documenta el swap de thumbs**: click en un `.mui-media-gallery__thumb`
  reemplaza el contenido y `src`/`srcset` de `__main`, mueve `aria-current="true"` al thumb
  elegido y actualiza el nombre accesible de `__main` por tag (`alt` en `<img>`/`<picture>`,
  `role="img"` + `aria-label` en `<svg>`); re-seleccionar el thumb activo es un no-op. JS de
  referencia cableado en `proof/commerce.html`.
- Contratos: **65 → 68** (nuevos `mui-pager`/`mui-stack`/`mui-cluster`; el resto — `mui-stat`,
  `mui-drawer`, `mui-chart`, `mui-footer`, `mui-media-gallery` — son variantes/behaviors sobre
  contratos existentes).
- AA-pairs audit de cierre: **0 pares nuevos** — el pager reusa `accent-text`/`text-muted` sobre
  `bg`/`surface`; stack/cluster no cargan color; `stat --lg` reusa `text`/`surface`|`bg`;
  `drawer --docked` reusa `text`/`surface` del drawer; `chart --line` reusa `--viz-*` (3:1) +
  `text-muted`; el mantra del footer reusa `text-muted`/`bg` — todos pares ya cubiertos por
  `scripts/contrast-pairs.mjs`.

## [0.4.0] — 2026-07-04

> **El trato:** dos variantes que cierran el cluster C del battle-test 0.3 — el stepper de
> cantidad extraído a primitiva compartida y las tabs con variante pill que estrena el patrón de
> filtro de panel único. Sin piezas nuevas (son variantes): **65 piezas** con contrato · **193
> pares AA** — audit de cierre: **0 pares nuevos**.

### Added
- **`mui-input-group--stepper`** — número ± segmentado: el grupo (`.mui-input-group--stepper`)
  lleva el borde/radio/foco, el `.mui-input` interior va borderless, y los botones
  `.mui-input-group__step` se deshabilitan (`[disabled]`) en los límites (el consumidor cablea
  click → ajusta `value` respetando min/max/step y emite `input`+`change`; cada botón lleva
  `aria-label` Decrease/Increase). Compone con `--sm`. El PDP y el cart-line de commerce lo
  adoptan — antes cada uno re-implementaba su propio control de cantidad.
- **`mui-tabs--pill`** — variante visual de `mui-tabs`: pestañas con forma de pill en vez del
  subrayado; la seleccionada = fondo `accent-subtle` + texto `accent-text` (el fill ES el
  indicador, sin `border-bottom`). El gallery la estrena para su filtro de categorías.

### Changed
- **El contrato de `mui-tabs` documenta el patrón de filtro de panel único:** todas las tabs de
  un `role="tablist"` apuntan a UNA región `role="tabpanel"` (vía `aria-controls`); seleccionar
  una tab filtra los ítems de esa región vía `[hidden]` en vez de cambiar de panel, con roving
  tabindex y `aria-selected` sincronizados por el JS del consumidor. Caveat documentado:
  `role="tab"` implica nativamente cambio de panel — usarlo para un filtro es un estiramiento
  aceptado del patrón (elegido por familiaridad sobre un toolbar `aria-pressed`).
- Contratos: **65 → 65** (sin cambio — ambas piezas son variantes, no piezas nuevas): actualizados
  `mui-input` (variante `stepper` + `group__step` en la anatomía) y `mui-tabs` (variante `pill`
  + el patrón de filtro en `a11y.behavior`).
- AA-pairs audit de cierre: **0 pares nuevos** — el stepper reusa `text`/`text-secondary` sobre
  `bg`/`surface` y la pill seleccionada reusa `accent-text`/`accent-subtle`, pares ya cubiertos
  por `scripts/contrast-pairs.mjs`.

## [0.3.0] — 2026-07-03

> **La plaza:** el header público (barra + off-canvas + overlay) — el tercer header del sistema,
> junto a `mui-topbar` (admin) y `mui-docs__topbar` (docs) — más contenido/media (`mui-card__media`,
> `mui-byline`) y un gate más estricto. **65 piezas** con contrato · **193 pares AA** · el check
> de `@layer` pasa de substring a brace-walk.

### Added
- **`mui-header` — la plaza, el header público de marketing.** Barra sólida sticky (brand + nav +
  actions) que colapsa a off-canvas ≤880px (mismo mecanismo que el shell docs: `[data-nav-open]`
  en el root, `aria-expanded` en el toggle, scrim `aria-hidden`) y variante `--overlay` transparente
  sobre un hero que se solidifica con `[data-scrolled]`. Cinco proofs migran a esta pieza
  compartida: el landing adopta la variante `--overlay`; blog, saas y gallery retiran sus headers
  bespoke (`blog-header*` / `troje-header*` / `gal-header*`); y commerce deja de **usar mal** el
  `mui-topbar` del shell admin (que no es un header de sitio público).
- **`mui-card__media`** — slot de cover edge-to-edge (16/9 default, `--media-ratio` configurable)
  para `.mui-card`, mismo tratamiento que ya tenía product-card. Pieza nueva: su slot acepta
  `:is(img, svg, picture)` de fábrica (no es un `img`-only que se haya "ensanchado").
- **`mui-byline`** — línea de autoría (avatar + nombre + meta: fecha · tiempo de lectura · rol);
  reusa `mui-avatar` tal cual, no reimplementa el círculo ni las iniciales. Variante `--sm` para
  filas densas/testimonios.
- **Media slots aceptan `:is(img, svg, picture)`** en product-card, media-gallery, media-grid y
  lightbox (antes `img`-only): los SVG token-driven ya pueden ocupar esos huecos sin plomería
  extra del consumidor. (`mui-hero__media` y `mui-cart-line__media` quedan `img`-only a propósito,
  ver backlog.)

### Changed
- **Gate de `@layer` endurecido: de substring a brace-walk.** `scripts/layer-guard.mjs` camina las
  llaves del CSS publicado para cazar reglas que queden FUERA de su `@layer` — el check anterior
  (buscar el string `@layer` una vez) no detectaba una regla escapada. Test propio
  (`layer-guard.test.mjs`) cableado a `npm test`.
- **El lightbox del gallery respeta el filtro activo.** El contador ahora lee "n / filtrados" y la
  navegación (flechas/teclado) cicla solo entre los ítems visibles, no los 12 totales — el
  contrato de `media-grid`/`lightbox` documenta el guard `[hidden]` que hace el filtro.
- Contratos: **63 → 65** (nuevos: `mui-header`, `mui-byline`; actualizados: card, product-card,
  media-gallery, media-grid, lightbox).

## [0.2.0] — 2026-07-03

> **La segunda cosecha:** documentación versionada, artefactos de contenido, vocabulario de
> layouts y el contrato de theming para plugins. **63 piezas** con contrato · **193 pares AA** ·
> todo el CSS publicado en `@layer milpa.*`.

### Added
- **Theming inyectable (la costura para plugins).** Todo el CSS publicado declara el orden
  canónico `@layer milpa.tokens, …, milpa.layouts` y envuelve sus reglas en su capa: **el CSS
  sin layer del consumidor/plugin siempre gana** — sin `!important`, sin guerras de
  especificidad. Tres niveles documentados en `THEMING.md` (retokenizar / reskin / reemplazo
  total). `theme.contract.json` (**generado**, drift-gated) publica tokens requeridos + los
  pares AA del gate **como datos** + invariantes; `scripts/verify-theme.mjs`
  (`npm run verify:theme`) es el validador de referencia — el que `coa` correrá al instalar un
  theme de plugin. Bonus: el `!important` del contrato reduced-motion, dentro de capa, le gana
  incluso al `!important` sin capa — el invariante queda blindado.
- **Tokens nuevos (paleta cerrada, como todo):** `--syntax-*` (11: highlighting de código,
  cada color verificado 4.5:1 sobre `--syntax-bg` en ambos temas) y `--viz-1..6` + `--viz-*-active`
  (paleta categórica de charts: 3:1 sobre `bg`/`surface`, separación de matiz/luminancia
  verificada para daltonismo, auto-borde regla 4).
- **`artifacts/` — *el elote*, 15 piezas de contenido con contrato:** Code (líneas, diff,
  highlight, clases `.tok-*`), Terminal, CodeGroup, Chart (bars/line/donut/sparkline), Quote,
  Callout (note/tip/warning/danger/version), Api (la cara de los docblocks), Steps, FileTree,
  Prose (tipografía long-form), Toc (scroll-spy por `aria-current`), Search (⌘K shell) + el kit
  de versionado: VersionSwitcher, VersionBanner ("You're viewing docs for v0.1.0…"), Changelog —
  y las variantes de estabilidad del Badge (`--since` / `--deprecated` / `--experimental`).
- **`layouts/` — *la parcela*, 11 piezas de estructura:** `mui-docs` (el shell de documentación
  versionada: 3 columnas, off-canvas, slots de switcher/search, pager, convención
  `/docs/{version}/{page}`), Page/Section/Container, Hero, FeatureGrid, CtaBand, Pricing, Faq
  (details nativo), Testimonial, Footer, MediaGrid (uniforme/masonry), Lightbox (dialog nativo).
- **Commerce en `components/`:** ProductCard, Price, Rating, MediaGallery, CartLine.
- **Seis battle-tests** en `proof/` (todo inglés, compuestos SOLO del sistema): `docs.html`
  (versionado completo), `blog`, `commerce`, `gallery` (lightbox real con teclado), `saas`, y
  **`themed.html`** — el blog vistiendo el skin "Nopal" (`themed-skin.css`: 12 tokens + radios,
  validado 193/193) sin tocar un solo bundle. La regla 2 (primario ghost en light) sobrevive al
  skin vía la cascada.
- Exports nuevos: `./artifacts.css`, `./layouts.css`, `./theme`, `./artifacts/*`, `./layouts/*`,
  `./package.json` (compat tooling, nota 0.1.1 del HANDOFF).

### Changed
- **Todo el CSS publicado vive en cascade layers** — nota de compat: los overrides sin layer de
  consumidores existentes ahora ganan SIEMPRE (antes dependían de especificidad). Es una mejora,
  pero es un cambio de comportamiento de cascada → minor bump.
- Los pares del gate viven en `scripts/contrast-pairs.mjs` (datos compartidos entre
  `verify-contrast.mjs` y el generador de `theme.contract.json`). Gate: **135 → 193 checks**.
  Governance verifica además la declaración `@layer` de cada CSS publicado (63 contratos).
- **La landing pasa a inglés** (el mantra "Siembra módulos, cosecha aplicaciones." queda en
  español, es la firma) y consume el vocabulario nuevo de `layouts/`; números actualizados a
  0.2.0.
- El scope de `.tok-*` cubre también `mui-api__signature` (`:is()`).

## [0.1.0] — 2026-07-01

> **Primera versión publicada en npm:** `npm i @milpa/design` · 59 archivos · 88 kB ·
> publicada por `teamx-devkit` con acceso público.

### Added
- **Base de componentes admin (HANDOFF T2 cumplido y extendido).** 29 piezas token-driven, cada
  una con su `*.contract.json` introspectable:
  - `primitives/milpa-primitives.css` — *el grano*: Button (primary/secondary/subtle/danger/ghost,
    sm/lg/icon, loading `[aria-busy]`), Field, Input (+input-group), Textarea, Select, Checkbox,
    Radio, Switch, patrón Choice, Badge, Kbd, Avatar (+group), Spinner, Progress, Divider.
  - `components/milpa-components.css` — *el frijol*: Tooltip (inversión token-pure `--text`/`--bg`),
    Menu, Card (+interactive/raised), Stat/KPI, EmptyState, Skeleton, Table (sticky header, sort
    `[aria-sort]`, selección `[aria-selected]`, densidad), Pagination, Tabs, Breadcrumbs, Alert,
    Toast (+viewport), Modal y Drawer (`<dialog>` nativo), y el esqueleto admin: Shell (+rail,
    off-canvas mobile), Sidebar (item actual con barra-grano), Topbar, PageHeader.
  - Convención transversal: **el estado se estiliza vía atributos ARIA/nativos** (`[disabled]`,
    `[aria-invalid]`, `[aria-busy]`, `[aria-selected]`, `[aria-current]`, `[aria-sort]`) — el hook
    de estilo es la semántica. Fills sólidos con auto-borde = su token `-active` (regla 4).
- Tokens nuevos `danger-hover` / `danger-active` (dark 300/500 · light 800/900) en DTCG + CSS +
  preset Tailwind — completan los estados de botón sólido destructivo.
- **Gate de contraste ampliado: 32 → 135 checks AA** (`scripts/verify-contrast.mjs`) — cubre todos
  los pares que consumen las primitivas y componentes (fills hover/active, tintes `*-subtle`,
  semánticos sobre `surface`/`overlay`/`*-bg`, boundaries de tabla/tabs/progress).
- **Logo kit integrado en `logo/`** (HANDOFF T4): símbolo Grano, wordmark grano-i, lockups h/v,
  app icon. Mono-oro verificado (el verde no entra al logo).
- Prueba visual del panel admin: `proof/milpa-admin-proof.html` (shell completo, tabla, formulario,
  overlays, dark/light, teclado end-to-end).
- `package.json`: exports `./primitives.css`, `./components.css`, `./primitives/*`,
  `./components/*`, `./logo/*`; `npm run proof` ahora sirve la raíz del repo.

- **CI (T3):** `.github/workflows/ci.yml` corre `npm test` en cada push/PR. `npm test` ahora
  encadena el gate de contraste (135 AA) + `scripts/verify-governance.mjs` nuevo: token-purity
  (sin hex/rampas/!important/z-index crudo/duraciones hardcodeadas), toda `var()` existente, y
  los 32 contratos JSON válidos con campos requeridos y tokens declarados reales.
- **LICENSE (T7):** texto completo canónico de Apache-2.0.
- **Snippet oficial del wordmark (T8.3)** en `logo/README.txt` + regla en DESIGN §2.

### Changed
- **Build pipeline (T1) — decisión: generador propio, Style Dictionary descartado.**
  `scripts/build-tokens.mjs` (cero dependencias) genera `dist/milpa-tokens.css` +
  `dist/tailwind.config.js` desde `tokens/milpa-tokens.json` con el manejo de temas exacto.
  Round-trip verificado contra el dist hand-authored: 0 tokens perdidos/cambiados. `npm test`
  suma el **drift gate** (`build-tokens.mjs --check`): el JSON es fuente de verdad real —
  editarlo sin regenerar rompe CI. Se retiraron `style-dictionary.config.mjs` y la
  devDependency (nunca instalada). `easing.linear` entró al JSON (estaba solo en el CSS).
- **`mui-stat__delta` desacopla dirección y valencia (T8.1):** `--up/--down` solo orientan la
  flecha; el color lo dan `--positive` (success) / `--negative` (danger). Antes `--down` implicaba
  danger, lo que mentía en KPIs donde bajar es mejorar (tiempo de build, incidencias).
- Contrato de table (T8.2): documentado el patrón de menú de fila a nivel `<body>` (el
  `overflow-x` del wrap clipea paneles internos).

### Fixed
- **Wordmark en los proofs:** el truco tipográfico del grano-dot (span desplazado sobre la `i`)
  renderizaba el grano flotando entre la `i` y la `l` (y la `i` conservaba su punto natural).
  Reemplazado por el **vector real del kit** (`logo/wordmark/`) inline: la `i` va sin punto y el
  grano ES el punto, en `var(--oro-300)` constante (el logo es mono-oro y no se adapta al tema,
  fiel a las variantes color-dark/light del kit).

### Added (scaffold inicial — 2026-06-30)
- **Paleta v0 cerrada** (dark-first): `oro` (primario/marca) + `olivo` (secundario / la milpa
  viva, OKLCH hue ~124°) + `tierra` (neutro); `cielo` como semántico `info`.
- Tokens en **DTCG** (`tokens/milpa-tokens.json`, fuente de verdad) + salida CSS
  (`dist/milpa-tokens.css`) + preset Tailwind (`dist/tailwind.config.js`).
- Sistema de **motion** ("el viento"): easings `standard/settle/grano/in`, primitivas
  `m-rise/m-fade/m-pop`, contrato `prefers-reduced-motion`.
- **`DESIGN.md`** — la constitución (alma, reglas de color, gobernanza de contratos-de-componente).
- Página de prueba `proof/milpa-ds-proof.html` (swatches, contraste, light/dark, selector de verde).

### Fixed (vs. borrador inicial "Milpa DS")
- Tema **light** reparado: 9 fallos WCAG AA resueltos (semánticos → -700, bordes → tierra-600/700,
  muted → tierra-700, focus → oro-700, primario = **ghost** porque el oro no contrasta como fill
  sobre crema). **32/32 pares AA** (dark + light).
- Tokens nuevos `on-danger` / `on-secondary` (invierten por tema).
- Selector `darkMode` de Tailwind corregido (dark bajo `:root` **y** `[data-theme="dark"]`).
- `azul` (índigo) retirado → reemplazado por `olivo` (marca) + `cielo` (info).
- 4 contradicciones del `DESIGN.md` resueltas (oro-fill light, ΔL "0.003", `on-danger` faltante, azul).
