# Milpa Design 0.9.0 — "el almácigo" (primitivas didácticas)

- **Fecha:** 2026-07-09
- **Estado:** aprobado (brainstorming con Rod) → pendiente de plan
- **Versión objetivo:** `@milpa/design@0.9.0` (minor — piezas nuevas aditivas en la capa
  `artifacts`; cero cambio a piezas existentes; sin ruptura).
- **Motivación:** la galería educativa de Milpa Academy (repo `academy/artifacts/`, construida
  2026-07-09) inventó con clases propias (`wb-*`) cuatro patrones interactivos que se repiten en
  material didáctico de arquitectura: la **parcela** de módulos con estados, el **pipeline** de
  etapas con recorrido, la **compuerta** de decisión tri-estado con auditoría, y el **log
  reproducible** con proyección. Mismo patrón que 0.3.0 "la plaza": lo que los battle-tests
  re-inventan con prefijo propio, el sistema lo adopta como pieza contratada. La academia se
  vuelve el battle-test de esta capa — dogfooding: *el material que enseña el sistema, construido
  con el sistema, ampliando el sistema*.

## 1. Principios (invariantes)

1. **Cero JS publicado** (regla vigente): las piezas entregan CSS + contrato; el comportamiento
   (sembrar, avanzar la canica, decidir, hacer scrub) es del consumidor, **documentado como JS de
   referencia en `a11y.behavior`** del contrato — precedente: tabs (filtro de panel único, 0.4.0)
   y media-gallery (swap de thumbs, 0.5.0).
2. **Estados por atributos, jamás clases de estado**: `data-state`/`data-status`/`aria-*` son el
   hook de estilo. El vocabulario de estados es parte del contrato (introspección para agentes).
3. **Paleta didáctica desde la semántica existente** (regla dura #6 respetada — olivo ≠ success):
   - `slot` (vacío, esperando) → neutro: `border` / `text-muted`.
   - `germinating` (vivo, en proceso) → **secondary/olivo** (la milpa viva; precedente: badge
     "germinating" de las landings y el sprout de la troje).
   - `sown` / estable-cosechado → **accent/oro** (el grano guardado; precedente: troje).
   - `complete` / éxito de operación → **success** (es *estado*, no marca).
   - `wilted` / `denied` / `failed` → **danger**; `skipped` → neutro muted; `waived` → **warning**
     (ámbar: exonerado explícito, ni éxito ni error).
4. **Cero pares AA nuevos como meta**: las cuatro piezas componen tintas y fondos ya cubiertos
   (`*-text` sobre `*-bg`/`surface`, `text`/`text-muted` sobre `bg`/`surface`). El audit de cierre
   lo verifica; si una combinación nueva aparece, entra como dato al gate (no se "aproxima").
5. **Paridad reduced-motion**: todo movimiento (canica, germinado, scrub) tiene equivalente
   instantáneo — el estado final es idéntico con y sin motion.

## 2. Alcance — cuatro piezas nuevas (contratos 68 → 72)

### A1 · `mui-plot` — la parcela (grafo de módulos con estados)

Destila `wb-field` / `wb-field__plot` / `wb-planted-module` / `wb-module-card[data-state]`.

- **Anatomía:** `mui-plot` (contenedor con `role="group"` del consumidor) → `mui-plot__core`
  (el tallo/núcleo, opcional) → `mui-plot__cell` (cada módulo). Slots internos de la celda:
  `__name`, `__contract` (línea mono `+ provee · ← requiere`), `__note` (motivo de estado).
- **Estados** (`data-state` en la celda): `slot` (default) · `germinating` · `sown` · `wilted`.
  Celda interactiva = `<button>` del consumidor (hereda focus-visible del sistema); deshabilitada
  vía `[disabled]`, nunca clase.
- **Motion:** germinar = rise+settle con `--ease-grano`; marchitar = fade a danger sin sacudida
  por default (el `wb-shake` de la galería NO se adopta — quien quiera drama lo agrega en su capa
  de consumidor). Reduced-motion: cambio de estado instantáneo.
- **a11y.behavior (JS de referencia):** siembra por click/teclado (el drag es *enhancement*
  opcional del consumidor y nunca el único camino); el resultado de cada intento se anuncia en un
  `role="status"`; el label accesible de la celda ES su contrato ("Sembrar X. Provee p. Requiere q").

### A2 · `mui-pipeline` — el tubo de etapas

Destila `wb-pipeline` / `__track` / `__stations` / `wb-station[data-status]` / `wb-runtime-stage`.

- **Anatomía:** `mui-pipeline` → `mui-pipeline__track` (la línea) → `mui-pipeline__stage` ×N
  (con `__label` y `__note`), y `mui-pipeline__marker` (la "canica") opcional posicionada por
  custom property `--pipeline-progress` (0..1) que setea el consumidor.
- **Estados** (`data-status` en la etapa): `idle` (default) · `active` · `complete` · `denied` ·
  `failed` · `skipped`. `denied`/`failed` visualmente distintos (danger fill vs danger border) —
  la galería ya los distingue y la distinción es semántica real del runtime.
- **Variantes:** `--vertical` (rail lateral, como la radiografía del runtime); densidad la da el
  contenedor, no la pieza.
- **Motion:** la canica se mueve con `--dur-moderate`/`--ease-settle` al cambiar
  `--pipeline-progress`; reduced-motion: salto instantáneo. Las etapas cambian de estado sin
  rebote (regla: germina y se asienta).
- **a11y.behavior:** el track es presentacional; el estado del recorrido se refleja en un
  `role="status"` textual ("detenido en autorizar: falta scope X") — la canica jamás es el único
  portador de información.

### A3 · `mui-gate` — la compuerta (decisión tri-estado + auditoría)

Destila `wb-request-card` / `wb-decision-row` / `wb-audit-terminal` / estados
`approved|rejected|waived|self-denied`.

- **Anatomía:** `mui-gate` → `__request` (la solicitud: `__actor`, `__action`, `__facts`) →
  `__decisions` (fila de acciones del consumidor: aprobar/rechazar/exonerar como `mui-btn`s) →
  `__outcome` (el veredicto) → `__audit` (lista append-only de pasajes; cada entrada con
  `__entry-actor`, `__entry-decision`, `__entry-time`).
- **Estados** (`data-status` en la raíz): `pending` (default) · `approved` (success) · `rejected`
  (danger) · `waived` (warning — ámbar explícito) · `self-denied` (danger + nota fija: el contrato
  DOCUMENTA que la pieza representa el rechazo-por-construcción de la auto-aprobación, espejo del
  orquestador real).
- **Regla de contrato:** `__audit` es visualmente append-only (las entradas no se reordenan ni
  desaparecen); la entrada `waived` lleva su marca ámbar — *la exoneración también es un dato*.
- **a11y.behavior:** decisiones = botones reales; el outcome se anuncia (`role="status"`); el
  audit es `role="log"` (anuncia solo lo nuevo).

### A4 · `mui-replay` — el log reproducible (append-only + proyección)

Destila `wb-event-stream` / `wb-replay-control` / `wb-projection` / `wb-event-terminal`.

- **Anatomía:** `mui-replay` → `__stream` (lista ordenada de eventos: `__event` con `__type`,
  `__actor`, `__payload` mono) → `__scrubber` (envuelve un `<input type="range">` nativo del
  consumidor — la pieza lo estiliza, no lo reemplaza) → `__projection` (el estado proyectado:
  pares `__stat-label`/`__stat-value`).
- **Estados:** `data-applied` en cada evento (`true|false` — dentro o fuera del corte del
  scrubber); el evento "actual" lleva `aria-current="step"`.
- **Motion:** al mover el corte, los eventos entran/salen con fade corto; reduced-motion:
  instantáneo. Nada "reproduce solo" — el tiempo lo controla la persona (o el agente).
- **a11y.behavior:** el range nativo da teclado gratis; `__projection` es `role="status"` con
  el resumen del estado proyectado ("evento 4/7 · estado: esperando verificación").

### A5 · Adopción (criterio de cierre, fuera del paquete)

La galería de `academy/artifacts/` se refactoriza para consumir las 4 piezas (las `wb-*`
equivalentes se retiran; lo que quede `wb-*` debe ser composición específica del artifact, no
patrón repetible). Ese refactor vive en el repo `academy` y es el **battle-test de cierre** del
release — mismo rol que los proofs de 0.2.0–0.6.0. Hallazgos nuevos → backlog, no scope-creep.

## 3. Reglas de la casa

- CSS en `@layer milpa.artifacts` (las 4 son artefactos de contenido — vecinas de Code, Terminal
  y Chart; **no** se crea capa nueva: `LAYER_ORDER` es contrato).
- Solo tokens semánticos; cero rampas crudas, cero `!important`, cero z-index crudo.
- Cada pieza con su `mui-*.contract.json` (plantilla: button/input); `anatomy` documentada;
  comportamiento del consumidor en `a11y.behavior`.
- `npm test` completo: contraste AA (pares como datos), governance (token-purity + contratos),
  layer-guard, drift. El audit de cierre reporta pares nuevos (meta: 0).
- Proof propio en el repo: **`proof/almacigo.html`** — un mini-artifact que compone las 4 piezas
  (una parcela de 3 módulos alimenta un pipeline cuya etapa `authorize` abre una compuerta cuyo
  resultado se aprecia en un replay). Dark/light/teclado/reduced-motion, como todo proof.

## 4. Fuera de alcance (explícito)

- **JS publicado** — sigue sin existir; la lógica de Kahn/proyección/decisión es del consumidor
  (en academy ya vive en `artifacts-core.js`, testeada).
- **Gamificación** (marcadores, granos del público, premios) — capa del consumidor/webinar.
- **El shell de la galería** (`wb-shell`, `wb-topbar`, navegación de artifacts) — es un caso de
  `mui-docs`/`mui-shell` existentes o composición propia; no es primitiva didáctica.
- **Charts** — `mui-chart` ya existe; no se duplica.

## 5. Preguntas abiertas (para el plan)

1. ¿`mui-plot__cell` prescribe grid propio o hereda del contenedor (`mui-feature-grid`/grid del
   consumidor)? Propuesta: la pieza da la celda; el layout lo da el consumidor (como cards).
2. ¿`mui-gate__audit` se extrae como pieza suelta (`mui-auditlog`) reutilizable fuera de la
   compuerta? Propuesta: en 0.9 vive dentro de gate; si un segundo consumidor lo pide, se extrae
   (regla: dos usos reales antes de generalizar).
3. Nombres en español vs inglés de los estados (`wilted` vs `marchito`): **inglés**, consistente
   con el vocabulario de contratos existente (`loading`, `disabled`) — el español vive en el
   contenido, no en la API.

## 6. Definición de hecho (DoD)

- [ ] 4 piezas en `artifacts/milpa-artifacts.css` bajo su capa, con sus 4 contratos (68 → 72).
- [ ] Tokens: cero nuevos (paleta semántica existente); si el plan descubre necesidad, entra por
      `tokens/milpa-tokens.json` + build, jamás hardcodeado.
- [ ] `proof/almacigo.html` compuesto solo del sistema, verificado dark/light/teclado/RM.
- [ ] `npm test` verde con audit de cierre de pares (meta 0 nuevos).
- [ ] CHANGELOG 0.9.0 «el almácigo» + README/HANDOFF/DESIGN actualizados (conteo y taxonomía).
- [ ] (Cierre externo) academy/artifacts consume las piezas; diff de comportamiento = 0 en los
      3 juegos y 5 inspecciones.
