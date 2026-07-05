# Milpa Design 0.8.0 — "el rocío" (cerrar los huecos de theming de marca + glass)

- **Fecha:** 2026-07-05
- **Estado:** aprobado (brainstorming) → pendiente de plan
- **Versión objetivo:** `@milpa/design@0.8.0` (minor — aditivo, cada token nuevo defaultea a su valor
  actual → cero cambio visual por defecto; sin ruptura).
- **Motivación:** el proof de theme-swap (Milpa ⇄ Brutalist) demostró que L1 alcanza para marca, pero
  dejó 2 huecos honestos: **`border-style` no es token** y **`backdrop-filter` está hardcodeado**; y un
  3er flavor **glassmorphism** revela un 3º: **`verify-theme` no maneja color con alpha** (superficies
  translúcidas). 0.8 cierra los tres y re-corre el proof con glass como 3er flavor.

## 1. Principio de seguridad (invariante)

Cada token nuevo defaultea a su valor actual (`--border-style: solid`, `--surface-backdrop: none`,
`--blur-*` = los valores hardcodeados actuales) → el build por defecto es **pixel-idéntico**. Verificación
central: diff de `getComputedStyle` = 0 en los 6 proofs (dark+light).

## 2. Alcance

- **G1 · `--border-style`** (default `solid`) — los ~83 bordes `var(--border-width) solid var(--x)` pasan
  a `var(--border-width) var(--border-style) var(--x)`. Cierra el gap del brutalismo (dashed/double/none).
- **G2 · Backdrop tematizable** — un `--surface-backdrop` (default `none`) aplicado en las superficies
  principales como `backdrop-filter: var(--surface-backdrop)` (glass lo prende); y tokenizar los blurs
  hardcodeados existentes (`blur(2px|4px|10px)` → `--blur-sm/base/lg` = 2px/4px/10px) para que también
  sean themeables.
- **G3 · `verify-theme` con translucidez** — parsear color con alpha (`#RRGGBBAA` / `rgba()`) y, cuando la
  cara-fondo de un par es translúcida, **componerla sobre `--bg`** (alpha-blend) antes de medir contraste
  — el color efectivo renderizado. El gate valida glass de verdad.
- **G4 · Proof** — glassmorphism como 3er flavor (`proof/skins/glass-skin.css`), light+dark; la barra del
  proof pasa a 3 marcas (Milpa | Brutalist | Glass) × 2 modos. Los 3 skins pasan `verify-theme`.

**Fuera de alcance (futuro conocido, del HANDOFF):** 3er eje de tema / forced-colors, single-source de
breakpoints, densidad, RTL. (Esos NO son huecos de *marca* — son ejes aparte.)

## 3. Reglas de la casa

- Tokens en `tokens/milpa-tokens.json` → `build-tokens.mjs` genera dist CSS + tailwind + `theme.contract.json`
  (drift-gated). NUNCA editar los generados a mano.
- CSS en su `@layer`; cero JS publicado; paleta cerrada (los tokens nuevos NO son colores → 0 pares AA
  nuevos). Aditivo → minor 0.8.0. Conteo de piezas con contrato sigue **68**.

## 4. G1 — `--border-style`

Nuevo token `--border-style: solid` (grupo nuevo `effect` en el JSON/contrato, junto a G2). Los bordes del
bundle que hoy son `var(--border-width) solid var(--x)` pasan a `var(--border-width) var(--border-style)
var(--x)` (~83 sitios; el plan confirma cada uno es un borde estructural, no otro uso de `solid`).
verify-theme form-checkea `--border-style` como keyword de border-style (`solid|dashed|dotted|double|none|
groove|ridge|inset|outset`).

## 5. G2 — Backdrop tematizable

- **`--surface-backdrop`** (default `none`): aplicado como `backdrop-filter: var(--surface-backdrop);
  -webkit-backdrop-filter: var(--surface-backdrop);` en las superficies principales — `.mui-card`,
  `.mui-modal`, `.mui-drawer`, `.mui-menu`, `.mui-popover` (las que hoy tienen `background: var(--surface)`
  y son "panel"). Default `none` = sin capa de backdrop-filter (cero cambio, cero costo). Un skin glass
  setea `--surface-backdrop: blur(12px) saturate(1.4)`. (El plan decide el set exacto de superficies; NO
  se toca el `::backdrop` de los overlays modales, que es otra cosa.)
- **`--blur-sm/base/lg`** (default `2px`/`4px`/`10px`): reemplazan los `blur(2px|4px|10px)` hardcodeados
  existentes (drawer `::backdrop`, header overlay, sticky bars — grep los 8 sitios) por `blur(var(--blur-*))`.
  Zero-change; los hace themeables. verify-theme form-checkea `--blur-*` como length y `--surface-backdrop`
  como `none` o cadena de filter-functions (no-vacía).

## 6. G3 — `verify-theme` con translucidez (composición sobre `--bg`)

En `scripts/verify-theme.mjs`:
1. El parser de color acepta, además de `#RRGGBB`: **`#RRGGBBAA`** (8 díg) y **`rgba(r,g,b,a)`**. Devuelve
   `{r,g,b,a}` (a=1 si opaco).
2. Nuevo helper `composite(fg_or_bg_rgba, baseHex)` = alpha-blend del color sobre `baseHex` (fórmula
   `out = src*a + base*(1-a)` por canal) → hex opaco efectivo.
3. En el loop de pares: resolver fg y bg; si el **bg** del par tiene `a < 1`, componerlo sobre el `--bg`
   resuelto del tema (que DEBE ser opaco — invariante nueva: `--bg` no puede ser translúcido) antes de
   calcular el contraste. (Si el fg tuviera alpha —raro— también se compone sobre el bg efectivo.)
4. Documentar el supuesto: **el gate compone las superficies translúcidas sobre `--bg`** como fondo de
   referencia; un consumidor que ponga glass sobre un fondo más complejo (gradiente/imagen) debe chequear
   el contraste efectivo a ojo (el gate cubre el caso base). Se agrega a THEMING.md + al contrato.

El resto del verificador (contraste WCAG, form-check de no-color, exit code) no cambia; la composición solo
transforma el color de fondo antes de la fórmula existente.

## 7. G4 — El proof: glassmorphism como 3er flavor

- **`proof/skins/glass-skin.css`** (solo tokens, L1): superficies translúcidas (`--surface`, `--surface-raised`,
  `--overlay` en `#RRGGBBAA` o `rgba`), `--surface-backdrop: blur(14px) saturate(1.4)`, bordes suaves
  (`--border` translúcido claro, `--border-width` fino), radios amplios (`--radius-*` grandes), sombras
  suaves difusas, motion suave. Acento vívido. Light (vidrio sobre fondo claro) + dark (vidrio sobre
  fondo oscuro). Los colores efectivos (compuestos sobre `--bg`) cumplen AA — se itera con `verify-theme`.
- **`proof/theme-swap.html`:** la barra de marca pasa de 2 a **3** (Milpa | Brutalist | Glass); el JS setea
  `data-skin` a `''`/`brutalist`/`glass`. Se agrega un **fondo decorativo con gradiente** al `<body>` (CSS
  de página, editorial — NO del sistema) SOLO para que el blur del glass tenga algo que difuminar; las
  superficies glass son translúcidas sobre ese fondo. 6 estados en vivo (3×2).
- El reporte del proof (§10 de su spec) se actualiza: qué reveló glass, y confirmación de que los 3 gaps
  quedaron cerrados (border-style, backdrop, gate con translucidez).

## 8. Entregables

- `tokens/milpa-tokens.json` + `build-tokens.mjs` → los tokens nuevos + regenerar dist/tailwind/contrato.
- CSS de los 4 bundles: border-style (~83), backdrop en superficies, blurs tokenizados.
- `scripts/verify-theme.mjs`: alpha + composición.
- `theme.contract.json` (generado): grupo `effect`, la invariante `--bg` opaco, la nota de composición.
- `THEMING.md`: border-style, `--surface-backdrop`/`--blur-*`, y cómo el gate maneja translucidez.
- `proof/skins/glass-skin.css` + `proof/theme-swap.html` (3er flavor) + el skin brutalist opcional puede
  estrenar `--border-style` si querés un detalle dashed.
- `package.json`/`CHANGELOG.md`/`README.md`/`HANDOFF.md`: bump 0.8.0, changelog «el rocío».
- Publicación npm + tag/release `v0.8.0`: acción de Rod.

## 9. Verificación

- `npm test` verde (193 AA + governance + 68 contratos + drift + layer-guard + verify-theme.test). El
  **diff de computed styles = 0** por defecto en los 6 proofs (border solid, sin backdrop, blurs iguales).
- `verify-theme` con **3 skins**: brutalist ALL PASS (sigue), glass ALL PASS (con composición), y un
  fixture glass MALFORMADO/insuficiente que **FALLA** (prueba que la composición realmente gatea). El
  test de regresión del form-gate se extiende con un caso de alpha.
- Navegador: los **6 estados** del proof en vivo — Glass muestra superficies translúcidas con blur real
  sobre el gradiente, bordes suaves, en light+dark; el swap es instantáneo; `getComputedStyle` confirma
  `backdrop-filter` resuelto y `--surface` con alpha. Consola limpia.

## 10. Preguntas abiertas

Ninguna — decidido: los 3 gaps (border-style, backdrop tematizable, gate con composición sobre `--bg`),
glass como 3er flavor, nombre «el rocío». El plan afina el set exacto de superficies con `--surface-backdrop`,
el grupo de tokens y los sitios de blur.
