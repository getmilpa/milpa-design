# Changelog — @milpa/design

Formato: [Keep a Changelog](https://keepachangelog.com/) · SemVer.

## [Unreleased]
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

## [0.1.0] — 2026-06-30
### Added
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
