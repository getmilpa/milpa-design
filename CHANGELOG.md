# Changelog — @milpa/design

Formato: [Keep a Changelog](https://keepachangelog.com/) · SemVer.

## [Unreleased]

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

### Fixed (vs. borrador inicial "Milpa DS")
- Tema **light** reparado: 9 fallos WCAG AA resueltos (semánticos → -700, bordes → tierra-600/700,
  muted → tierra-700, focus → oro-700, primario = **ghost** porque el oro no contrasta como fill
  sobre crema). **32/32 pares AA** (dark + light).
- Tokens nuevos `on-danger` / `on-secondary` (invierten por tema).
- Selector `darkMode` de Tailwind corregido (dark bajo `:root` **y** `[data-theme="dark"]`).
- `azul` (índigo) retirado → reemplazado por `olivo` (marca) + `cielo` (info).
- 4 contradicciones del `DESIGN.md` resueltas (oro-fill light, ΔL "0.003", `on-danger` faltante, azul).
