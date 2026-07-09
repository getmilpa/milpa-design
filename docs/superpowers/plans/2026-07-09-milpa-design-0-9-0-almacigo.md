# Plan 0.9.0 — "el almácigo" (primitivas didácticas)

- **Spec:** `docs/superpowers/specs/2026-07-09-milpa-design-0-9-0-almacigo.md` (aprobado)
- **Fecha:** 2026-07-09 · **Estado:** en ejecución

## Resolución de preguntas abiertas del spec

1. **Layout de `mui-plot`:** la pieza da la celda y un grid contenedor por defecto
   (`auto-fill minmax(11rem, 1fr)` — precedente feature-grid); el consumidor puede
   sobreescribir el layout sin pelear (su CSS gana por capas).
2. **`__audit` dentro de `mui-gate`** (no pieza suelta): regla de dos usos reales antes de
   generalizar. Las chips de decisión del audit **componen `mui-badge`** (success/danger/warning)
   → cero pares nuevos y cero re-invención.
3. **Estados en inglés** (`sown`, `wilted`, `germinating`…) — la API en inglés, el contenido en
   el idioma del consumidor.

## Mapa de tinta/fondo por estado (todos pares YA gateados)

| Estado | Fondo | Borde | Tinta | Precedente del par |
|---|---|---|---|---|
| slot / idle | `surface` | `border` | `text` / `text-muted` | base |
| germinating | `secondary-subtle` | `secondary-border` | `secondary-text` | callout --tip |
| sown / active / current | `accent-subtle` | `accent` (≥3:1 gate) | `accent-text` (o `text`) | callout --version |
| complete / approved | `success-bg` | `success-border` | `success` | badge/alert |
| wilted / denied / failed / rejected / self-denied | `danger-bg` | `danger-border` (failed: `danger`) | `danger` + cuerpo `text-secondary` | callout --danger |
| waived | `warning-bg` | `warning-border` | `warning` | callout --warning |
| skipped | transparente | `border-subtle` | `text-muted` | base |

**Audit de cierre esperado: 0 pares nuevos.**

## Tareas

- [x] **T1 · CSS** — cluster nuevo "almácigo · didácticas" al final de
      `artifacts/milpa-artifacts.css` (dentro de `@layer milpa.artifacts`): `mui-plot`,
      `mui-pipeline`, `mui-gate`, `mui-replay`. Guard `[hidden]` en las 4 raíces (display propio
      flex/grid). Solo tokens semánticos; canica por `--pipeline-progress` (custom prop del
      consumidor, prefijo de pieza — no entra al contrato de theming).
- [x] **T2 · Contratos ×4** — `artifacts/milpa-{plot,pipeline,gate,replay}.contract.json` con los
      8 campos del validador + anatomy + a11y.behavior (JS de referencia del consumidor) +
      motion/reducedMotion. Conteo 68 → 72.
- [x] **T3 · Proof** — `proof/almacigo.html`: los 4 compuestos en una historia (parcela alimenta
      pipeline; authorize abre compuerta; el proceso se relee en replay), con JS de referencia
      mínimo (cambiar estados, scrub, decidir), theme toggle, dark/light/teclado/RM.
- [x] **T4 · Release-docs** — CHANGELOG 0.9.0 «el almácigo»; README (estado + 72); HANDOFF §2;
      DESIGN apéndice (fila artifacts); `package.json` → 0.9.0.
- [x] **T5 · Gates** — `npm test` completo verde + audit manual de pares (meta 0 nuevos).
- [ ] **T6 · (Externo, repo academy)** — refactor de la galería para consumir las piezas; se
      ejecuta después del release del DS. Queda fuera de estos commits.
