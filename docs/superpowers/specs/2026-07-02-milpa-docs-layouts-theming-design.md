# Spec — Docs versionadas, artefactos, layouts y theming inyectable (`@milpa/design` 0.2.0)

> Diseño validado con Rod el 2026-07-02. Contexto: [`DESIGN.md`](../../../DESIGN.md) (la
> constitución) y [`HANDOFF.md`](../../../HANDOFF.md). Este spec define la segunda cosecha del
> design system: la capa de contenido/documentación y el contrato de theming para plugins.

## 1. Objetivo

Una sola inversión, dos consumidores:

1. **milpa.lat** — la landing evoluciona a sitio con **documentación versionada** (0.1.0, 0.2.0,
   …): siempre sabés qué versión leés. El contenido lo genera el framework desde sus docblocks
   (repo `teamx`); acá se resuelven layouts, componentes y contratos.
2. **Los plugins de Milpa** — reusan estos mismos componentes/layouts para armar blog, ecommerce,
   gallery, SaaS, dashboards; y pueden **reemplazar por completo** el look & feel inyectando su
   propio design/motion system. El mecanismo de DI es del framework; acá se diseña el **contrato
   de theming** (qué se sobreescribe, cómo, y qué invariantes sobreviven).

## 2. Decisiones cerradas (Q&A con Rod)

| Decisión | Resolución |
|---|---|
| Política de JS | **CSS-only + contrato** (status quo). El paquete publica shells visuales con todos sus estados; el comportamiento va especificado en `a11y.behavior` de cada contrato y lo implementa el framework/plugin. Los proofs sí pueden demostrar comportamiento con JS inline (el proof no es el paquete). |
| Versionado de docs | Kit completo: version switcher + banner de versión vieja + badges since/deprecated/experimental + vista de changelog. |
| Casos de uso primera ola | Blog/editorial, Ecommerce, Gallery/portfolio, SaaS — los cuatro. Custom dashboards se cubre con theming sobre el `mui-shell` existente. |
| Idioma | Todo lo público en **inglés** (docs, landing, proofs). Taglines de marca quedan en español como firma intraducible ("Siembra módulos, cosecha aplicaciones"). Docs internos del repo siguen en español. |
| Enfoque | **A**: bundles `artifacts/` + `layouts/`, casos de uso como proofs compuestos, theming vía CSS cascade layers + `theme.contract.json`. Sale como **0.2.0**. |

## 3. Arquitectura

### 3.1 Estructura nueva del paquete

```
artifacts/milpa-artifacts.css    # el elote: piezas de contenido (+ *.contract.json)
layouts/milpa-layouts.css        # la parcela: estructura de página (+ *.contract.json)
theme.contract.json              # contrato de theming legible por máquina (raíz del repo)
THEMING.md                       # el contrato explicado para humanos
proof/docs.html · blog.html · commerce.html · gallery.html · saas.html · themed.html
```

Exports nuevos en `package.json`: `"./artifacts.css"`, `"./layouts.css"`, `"./artifacts/*"`,
`"./layouts/*"`, `"./theme"` → `./theme.contract.json`. `files` suma `artifacts`, `layouts`,
`theme.contract.json`, `THEMING.md`. Además la nota 0.1.1 pendiente del HANDOFF:
`"./package.json": "./package.json"`.

Los componentes de dominio commerce (§6.3) van a `components/` — son componentes UI, no
estructura de página ni artefactos de contenido.

### 3.2 Cascade layers — el mecanismo de swap es la plataforma

Todo el CSS publicado se declara en capas nombradas:

```css
@layer milpa.tokens, milpa.motion, milpa.primitives, milpa.components, milpa.artifacts, milpa.layouts;
```

- **Cada archivo publicado abre declarando el orden completo** de capas (la declaración es
  idempotente): cualquier orden de import produce la misma cascada.
- `dist/milpa-tokens.css` es generado → `scripts/build-tokens.mjs` emite el wrapper
  `@layer milpa.tokens { … }` (drift gate igual que hoy).
- Regla nueva de governance: *todo CSS publicado declara su `@layer`* (verificado en
  `verify-governance.mjs`).

Como el CSS **sin** layer siempre gana al CSS **con** layer, el override de un plugin/consumidor
gana por definición — sin `!important`, sin guerras de especificidad.

**Compatibilidad:** envolver el CSS existente en layers baja su precedencia frente a CSS sin
layer, así que los overrides existentes de consumidores siguen ganando (mejora, no rompe). Es
igualmente un cambio de comportamiento de cascada → bump a **0.2.0**.

### 3.3 Tres niveles de inyección (THEMING.md)

1. **Retokenizar** — el plugin redefine custom properties (color, tipografía, radios, motion).
   Todo cambia de piel; layout y a11y intactos. `data-theme` dark/light sigue funcionando.
2. **Reskin** — además trae CSS propio (sin layer o en una capa posterior) que reemplaza la piel
   de cualquier `mui-*` o suma componentes propios.
3. **Reemplazo total** — no importa nuestros bundles de components/artifacts/layouts y trae su
   design/motion system completo. Solo debe honrar el contrato (§3.4).

### 3.4 `theme.contract.json` — nada se siembra sin contrato, tampoco un theme

Contrato legible por máquina que declara lo que **cualquier** theme inyectado debe cumplir:

- **Tokens requeridos**: la lista de tokens semánticos que el sistema consume (nombres, no
  valores).
- **Pares de contraste como datos**: los pares del gate se extraen de `verify-contrast.mjs` a un
  módulo único (`scripts/contrast-pairs.mjs`) consumido por (a) el verificador y (b) un paso de
  build que los emite dentro de `theme.contract.json` — una sola fuente de verdad, drift-gated
  como `dist/`.
- **Invariantes**: paridad reduced-motion, `:focus-visible` visible, `data-theme` presente.

La jugada a futuro: `coa` valida el theme de un plugin contra este contrato al instalarlo. El
quality floor deja de ser una promesa de este repo y se vuelve contrato ejecutable del ecosistema.

## 4. Tokens nuevos (los únicos que este trabajo exige)

1. **`--syntax-*`** — keyword, string, comment, function, number, punctuation, variable, tag,
   attribute (+ los que el diseño de `mui-code` requiera), definidos por tema en el DTCG JSON.
   **Cada uno AA 4.5:1 sobre el fondo de código en dark y light**, verificado en el gate. El
   highlighter real (Shiki/Prism, lado framework) solo mapea a estas variables.
2. **`--viz-1..6`** — paleta categórica para charts: theme-aware, distinguible para daltonismo,
   3:1 contra `--bg`/`--surface`. Entra al gate.

Flujo de siempre: `tokens/milpa-tokens.json` → `npm run build` → drift gate.

## 5. Artefactos (`artifacts/`, prefijo `mui-*`)

Cada pieza sigue el molde (header de `milpa-primitives.css`): estados vía atributos ARIA/nativos,
solo tokens semánticos, auto-borde `-active` en fills, contrato JSON con `a11y.behavior`.

| Pieza | Anatomía / notas |
|---|---|
| `mui-code` | Bloque de código: header (filename, badge de lenguaje), slot botón copiar, números de línea, resaltado de línea, líneas diff `+/−` (success/danger). Colores solo vía `--syntax-*`. |
| `mui-terminal` | Ventana terminal: prompt (`$`/`coa`), líneas output, estados running/done/error (`[aria-busy]`, `[data-exit]`), cursor parpadeante con paridad reduced-motion (cursor estático). |
| `mui-code-group` | Código multipestaña (PHP/CLI/JSON): composición `mui-tabs` + `mui-code`, contrato propio. |
| `mui-chart` | Shells CSS/SVG: barras (h/v), línea/área (stroke por tokens), donut, sparkline; leyenda, ejes; tooltips reusan `mui-tooltip`. Datos los inyecta el consumidor. Colores solo `--viz-*`. |
| `mui-quote` | Pull-quote editorial + variante con atribución (autor/rol/avatar). |
| `mui-callout` | note / tip / warning / danger / version-note para prosa de docs: icono + título + prosa. Pariente de `mui-alert` con anatomía de documento. |
| `mui-api` | Entrada de referencia API (la cara de los docblocks): firma coloreada con `--syntax-*`, tabla de parámetros (reusa `mui-table`), returns/throws, badges de estabilidad. |
| `mui-steps` | Procedimiento numerado (guías); doble turno como checkout steps en commerce. |
| `mui-file-tree` | Árbol de archivos para docs de estructura. |
| `mui-prose` | Scope tipográfico long-form (h1–h6, listas, tablas, blockquote, links, imágenes, hr). Base compartida de docs y blog. |
| `mui-toc` | Tabla de contenidos, scroll-spy vía `[aria-current]` (comportamiento en contrato). |
| `mui-search` | Trigger ⌘K + shell del modal de búsqueda (compone `mui-modal` + `mui-kbd`). El backend de búsqueda es del framework. |

**Kit de versionado:**

| Pieza | Anatomía / notas |
|---|---|
| `mui-version-switcher` | Selector de versión (composición sobre `mui-menu`), siempre visible en el docs shell. |
| `mui-version-banner` | Aviso persistente en docs no-latest: "You're viewing docs for v0.1.0 — latest is v0.3.0" + link. |
| Badges de estabilidad | Variantes de `mui-badge`: `--since` / `--deprecated` / `--experimental` (bump del contrato de badge). |
| `mui-changelog` | Entradas agrupadas por versión; tipos added/changed/fixed/removed mapeados a semánticos existentes. Cubre la "vista de cambios entre versiones" v1 (diff de API renderizado por el framework dentro de esta anatomía). |

## 6. Layouts (`layouts/`)

### 6.1 El shell de documentación

`mui-docs`: 3 columnas (nav lateral / artículo / TOC), colapso responsive off-canvas (mismo
patrón que `mui-shell` admin), slots fijos para version-switcher y search, pager prev/next,
breadcrumbs reusados. Convención de URL `/docs/{version}/{page}` documentada en el contrato
(el routing lo hace el framework).

### 6.2 Vocabulario de página (marketing/media)

- `mui-page` / `mui-section` / `mui-container` — formalizan los `ld-*` de la landing.
- `mui-hero`, `mui-feature-grid`, `mui-pricing`, `mui-faq` (sobre `<details>` nativo),
  `mui-testimonial` (compone quote), `mui-cta-band`, `mui-footer` (mega footer).
- `mui-media-grid` (uniforme + masonry) y `mui-lightbox` (shell sobre `<dialog>` nativo).

### 6.3 Componentes de dominio commerce (van a `components/`)

`mui-product-card`, `mui-price`, `mui-rating`, `mui-media-gallery` (ficha de producto),
`mui-cart-line`.

## 7. Casos de uso = proofs, no CSS

Cada proof compone el vocabulario, battle-testea dark/light/mobile/teclado, y le muestra a un
autor de plugin exactamente cómo armar el suyo. Contenido dummy en inglés.

- `proof/docs.html` — sitio de docs completo: switcher v0.1.0/v0.2.0, banner de versión vieja,
  `mui-api` con badges, changelog, search shell.
- `proof/blog.html` — listado + artículo (prosa, hero, autor, tags, relacionados).
- `proof/commerce.html` — grid de productos + ficha + carrito/checkout (steps).
- `proof/gallery.html` — media-grid masonry + lightbox + página de pieza.
- `proof/saas.html` — landing de producto: pricing, feature grid, testimonios, FAQ.
- `proof/themed.html` — **la prueba del contrato de theming**: el mismo blog con un skin de
  plugin inyectado (nivel 1 retokenizado + nivel 2 reskin), validado por el gate.

## 8. La landing

- Pasa a **inglés**; taglines de marca en español como firma.
- Gana navegación hacia Docs (header) y la estructura pensada para `/docs`.
- Sus estilos `ld-*` migran al vocabulario `mui-*` de `layouts/` — la landing es el primer
  consumidor real de la parcela. El momento firma (GSAP, granos → M) se conserva tal cual;
  el JS de proof/landing sigue permitido (el paquete no lo publica).

## 9. Verificación (el gate crece con el sistema)

- **Contraste**: pares nuevos — `--syntax-*` sobre fondo de código, `--viz-*` sobre
  `--bg`/`--surface`, callouts, version banner, links de prosa. Estimado 135 → ~200 checks.
- **Governance**: dirs nuevos (`artifacts/`, `layouts/`) bajo las mismas reglas (token-purity,
  sin `!important`/z-index crudo/duraciones hardcodeadas, contratos válidos) + regla nueva:
  todo CSS publicado declara `@layer`.
- **Drift**: `build-tokens.mjs --check` cubre los tokens nuevos; `theme.contract.json` se
  genera desde `scripts/contrast-pairs.mjs` y también queda drift-gated.
- Todo encadenado en `npm test`, CI existente lo corre.

## 10. Fases de implementación

1. **F1 · Cascada + contrato**: re-arquitectura `@layer` de todo el CSS publicado (build
   incluido), `scripts/contrast-pairs.mjs`, `theme.contract.json` generado, `THEMING.md`,
   regla de governance nueva. *Fundación: todo lo demás se apoya acá.*
2. **F2 · Tokens + artefactos**: `--syntax-*` y `--viz-*` al DTCG, bundle `artifacts/` completo
   con contratos, pares nuevos al gate.
3. **F3 · Docs**: `mui-docs` + kit de versionado + `proof/docs.html`.
4. **F4 · Parcela**: vocabulario de página + media + componentes commerce.
5. **F5 · Proofs de casos de uso**: blog, commerce, gallery, saas, themed.
6. **F6 · Landing en inglés** migrada al vocabulario nuevo + `CHANGELOG` + release 0.2.0.

Cada fase deja `npm test` en verde; F2–F4 son paralelizables por cluster una vez que F1 fija la
fundación.

## 11. Fuera de alcance

- Implementación del JS de comportamiento (framework/plugins, vía `a11y.behavior`).
- El mecanismo de DI para inyectar themes (repo `teamx`).
- Generación de contenido desde docblocks y routing `/docs/{version}` (repo `teamx`).
- Backend de búsqueda (solo el shell UI).
- i18n con switcher de idioma.
- Split multi-paquete (`@milpa/design-core/-artifacts/-layouts`) — se revisita si duele.
- Storybook formal (T5 del HANDOFF sigue siendo futuro; los proofs cubren v0).

## 12. Criterios de éxito

- `npm test` en verde: ~200 pares AA + governance (con regla `@layer`) + drift (tokens y
  theme contract).
- Los 6 proofs verificados visualmente en dark, light y mobile, navegables por teclado.
- `proof/themed.html` demuestra un swap de look & feel completo **sin tocar** los bundles
  publicados y pasando el gate.
- Un autor de plugin puede leer `THEMING.md` + `theme.contract.json` y saber exactamente qué
  proveer, sin leer el CSS interno.
- Todo componente nuevo tiene su `*.contract.json` (estimado: ~30 contratos nuevos, ~62 total).
