# Changelog — @milpa/design

Formato: [Keep a Changelog](https://keepachangelog.com/) · SemVer.

## [Unreleased]

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

### Fixed (vs. borrador inicial "Medusa/Milpa DS")
- Tema **light** reparado: 9 fallos WCAG AA resueltos (semánticos → -700, bordes → tierra-600/700,
  muted → tierra-700, focus → oro-700, primario = **ghost** porque el oro no contrasta como fill
  sobre crema). **32/32 pares AA** (dark + light).
- Tokens nuevos `on-danger` / `on-secondary` (invierten por tema).
- Selector `darkMode` de Tailwind corregido (dark bajo `:root` **y** `[data-theme="dark"]`).
- `azul` (índigo) retirado → reemplazado por `olivo` (marca) + `cielo` (info).
- 4 contradicciones del `DESIGN.md` resueltas (oro-fill light, ΔL "0.003", `on-danger` faltante, azul).
