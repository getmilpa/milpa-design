# Milpa — Design System

> **DESIGN.md — la constitución.** Léelo primero. No describe pixeles: describe el *alma*, las
> reglas y la gobernanza con las que se construye toda la UI de Milpa. Las herramientas (Claude
> Design, Claude Code) y los agentes deben construir con el **por qué**, no copiando lo de encima.
>
> Tagline: **Siembra módulos, cosecha aplicaciones.**

---

## 1. Alma — la idea raíz

Una **milpa** no es un cultivo, es un *sistema*. Policultivo: las tres hermanas — maíz, frijol y
calabaza — crecen juntas y se nutren entre sí. Y, clave: la milpa es **agricultura determinista y
cultivada**, no maleza silvestre. Orden que produce abundancia.

Ese es el framework, y por extensión su design system. El concepto rector es **crecimiento
cultivado**: obtienes UI extensible que crece rápido *porque* el sistema es determinista y está bien
estructurado debajo.

**La tensión que define todo lo visual:** precisión de infraestructura de IA × calidez de la milpa.
Dark-first, geométrico, sistemático (el lado máquina) — con alma mesoamericana cálida y auténtica
(el lado tierra). El grid de granos de la mazorca es la firma geométrica.

**Cómo debe sentirse cada pantalla:** precisa, cálida, determinista. Módulos que componen. Nada
decorativo sin propósito. Movimiento que *germina y se asienta*, nunca rebota.

**Anti-patrones (prohibido):** folclore literal (sombreros, pastiche de códice, mascota-elote),
gradientes ruidosos, sombras dramáticas, "diversión" que rompa la sobriedad. La milpa se expresa por
**sistema y geometría**, no por adorno.

Mapa metáfora → arquitectura (el corazón conceptual):

| Hermana   | Rol técnico         | En el design system           |
|-----------|---------------------|-------------------------------|
| Maíz      | núcleo / kernel     | foundations (tokens)          |
| Frijol    | plugins (eventos)   | components que componen        |
| Calabaza  | contratos / validación | gobernanza que protege      |

---

## 2. Fundamentos de marca

**Logotipo.** Símbolo **Grano**: la letra M cosechada de una rejilla 5×5 de granos de maíz (muchos
módulos → una identidad). Mono-oro a propósito; el secundario (verde olivo) NO entra en el logo. Detalle firma: el punto
de la `i` del wordmark es un grano. Respeto mínimo = 1 módulo. Tamaño mínimo del símbolo = 16 px.
Assets vectorizados en el kit (`/logo`). **En HTML el wordmark se usa SOLO como vector del kit**
(la `i` va sin punto; el grano ES el punto, en `oro-300` constante — nunca `var(--accent)`, nunca
trucos tipográficos): snippet oficial en `logo/README.txt`.

**Tipografía — la dualidad humano⇄agente.**
- **Display / UI:** Space Grotesk (medium, tracking ≈ −2%, minúsculas para el wordmark). Grotesque
  técnica para la marca.
- **Código / CLI / labels:** Space Mono. La mono para la máquina.

**Voz.** Clara y directa · precisa (los términos significan algo) · terrenal y cálida · con orgullo
de raíz, sin disfraz. Léxico: sembrar, cultivar, cosechar, germinar, raíz, terreno, semilla. CLI:
**`coa`** — el bastón plantador / *huictli*, la herramienta con que se siembra la milpa (*siembra
módulos*). El wordmark `milpa` es la marca; `coa` es el comando.

---

## 3. Sistema de color

**Filosofía:** dark-first. Marca = **oro** (el grano cosechado) + **olivo** (la milpa viva que
germina); neutro = **tierra**; semánticas = **success/warning/danger** + **cielo** (info).
Generadas en **OKLCH**: los pasos buscan uniformidad perceptual pero están afinados a mano en los
extremos — el paso `900→950` se estira a propósito para dar un fondo profundo dark-first; **no
asumas ΔL constante**.

| Rampa   | Ancla            | Rol                                  |
|---------|------------------|--------------------------------------|
| tierra  | `950 #17120D` · `100 #ECE6D8` (cal) | neutro cálido: fondos, superficies, texto |
| oro     | `300 #E8B14C`    | acento / marca (primario)            |
| olivo   | `700 #566D19` · `500 #85A143` | secundario / marca fría: el verde vivo de la milpa |
| cielo   | `700 #1E63B2`    | info (semántico — **NO** es la marca) |
| success | `400 #5EC478` (green) | éxito                           |
| warning | `400 #F78A47` (calabaza/orange) | aviso                 |
| danger  | `400 #FF7F71` (chile/red) | error / destructivo         |

### Reglas duras (gobernanza — aprendidas con sangre)

Estas reglas son **innegociables**; los valores hex exactos son un *baseline a refinar en el canvas*.

1. **Superficies en dark = elevaciones contenidas.** `bg`→`surface`→`surface-raised` = `tierra
   950→900→800` (neutro-cálido oscuro): elevación sutil pero **visible** (ΔL≈0.10 OKLCH / contraste
   ~1.4:1) — **nunca** saltos a marrón claro (eso se ve "lodoso"). Buena parte de la definición la
   dan los **bordes**, no solo la luminancia.
2. **Los acentos cambian de paso según el tema, para mantener contraste:**
   - Oro: **fill claro en dark** (`oro-300` + tinta oscura). En **light el oro NO va como fill
     sólido** — no contrasta sobre crema (boundary 1.6:1 medido). El primario en light es **ghost**:
     borde `oro-600` + texto `oro-700` (4.9:1). Como *texto/ícono* en light, oro usa `oro-700`.
     *Alcance:* la regla veta el oro como fill de **componente con tinta encima** (botones, chips);
     como **indicador gráfico** sin texto y con ≥3:1 verificado (subrayado de tab, fill de
     progress), `oro-600` (= `--accent` light) sí está sancionado: 3.4:1 sobre crema, 3.9:1 sobre
     el track `surface-raised` (pares en el gate).
   - Verde (olivo, secundario): **claro en dark** (`olivo-400/500`), **profundo en light** (`olivo-700/800`).
   - Info (cielo): **claro en dark** (`cielo-400`), **profundo en light** (`cielo-700`).
   - Danger: **más oscuro en light** (`danger-700`); `on-danger` se invierte (tinta oscura en dark,
     clara en light). Igual `on-secondary` para el fill verde.
3. **Todo par texto/UI cumple WCAG AA:** 4.5:1 texto normal, 3:1 boundary de componente. (Set actual: 32/32 ✓.)
4. **Botones sólidos llevan un auto-borde sutil** (un paso más oscuro de su propio color) para
   definir el boundary, sobre todo en light.
5. **El verde (olivo) es marca fría / secundario** y **cielo es solo `info`** — ninguno compite con
   el oro como acción primaria.
6. **El verde de marca (olivo, hue ~124°) vive lejos del verde de `success` (~150°)** para no
   confundir "marca" con "estado ok": olivo lee caqui/campo, success lee pasto.

### Tokens semánticos

Estructura: `primitivos (rampas 50–950)` → `semánticos (rol)` con override por tema. Dark es el
default (`:root` **y** `[data-theme="dark"]`); light se activa con `[data-theme="light"]`. Convención:
`<html>` **siempre** lleva `data-theme` (nunca ausente) para que las utilidades `dark:` de Tailwind
matcheen. Ver `milpa-tokens.css` / `.json` (DTCG) / `tailwind.config.js`. Roles: `bg, surface,
surface-raised, overlay, border-subtle, border, border-strong, text, text-secondary, text-muted,
text-on-accent, on-danger, on-secondary, accent (+hover/active/subtle/text), secondary
(+hover/active/subtle/border/text), success/warning/danger/info (+bg/border), focus`. `secondary`=olivo,
`info`=cielo. Todos los pares verificados WCAG AA (32/32).

---

## 4. Sistema de motion — "el viento"

El lenguaje es **crecimiento cultivado**: las cosas **germinan y se asientan** (rise + fade + settle).
Determinista y sutil, igual que el framework — **nunca** rebota como caricatura.

**Tres niveles:**
- **micro** — feedback de estado (hover/press/toggle/focus). CSS/Web Animations, token-driven, rápido.
- **macro** — entradas y transiciones. Rise + fade con stagger.
- **choreography** — secuencias orquestadas con **GSAP + ScrollTrigger** (técnica frame-sequence
  estilo Apple para el hero).

**Momento firma:** el **logo ensamblándose** — los granos asentándose en la M al hacer scroll. La
tesis de marca hecha movimiento: muchos módulos → una identidad. Muy sutil.

**Tokens:** durations (`instant→deliberate`), 4 easings — `standard`, `settle`, **`grano`**
(`cubic-bezier(.16,1,.3,1)`, expo-out, el gesto de ensamblar/germinar), `in` — `stagger`, `rise`.
Ver `milpa-motion.css` (primitivas `m-rise`/`m-pop`/`m-transition`) y `milpa-motion.js` (config GSAP).

**Contrato de reduced-motion (innegociable):** toda animación tiene fallback reducido (opacity-only /
instantáneo). Ninguna pieza se mueve contra la preferencia del usuario.

---

## 5. Foundations (referencia)

- **Spacing:** escala base-4 (`--space-*`).
- **Radius:** `none → xs/sm/base/md/lg/xl/2xl → full`. Base = `0.5rem`. Granos = `rx ≈ 0.25 × lado`.
- **Elevation:** sombras tuneadas por separado para dark y light (`--shadow-sm/base/md/lg`).
- **Z-index:** escala ordenada — `dropdown 1000 → sticky → backdrop → drawer → modal → popover →
  toast → tooltip 1700`.
- **Tipografía:** escala `2xs → 6xl`, line-heights, pesos, tracking, y estilos compuestos
  (`display, heading, body, caption, code`). Ver `milpa-tokens.*`.

---

## 6. Gobernanza — cómo se opera el sistema

**Arquitectura por capas** (se construye de abajo hacia arriba, por dependencia):

```
Surfaces    · la cosecha   → landing (GSAP), admin dashboard, dev-bar, marketplace, ecommerce, blog
Patterns    · la milpa     → LoginForm, Chat, Kanban, Gallery, Timeline, Calendar, Profile, …
Components  · el frijol     → Card, Modal, Drawer, Toast, DataTable, Autocomplete, Form, …
Primitives  · el grano      → Button, Input, Select, Switch, Checkbox, Radio, Badge, Tooltip, …
Foundations · el suelo      → color ✓, type, spacing, radius, elevation, z-index, motion ✓
```

**El contrato de componente — Milpa aplicado a sí mismo.** Nada entra al sistema sin su contrato:
un spec **legible por máquina** que declara `props, variantes, estados, slots, tokens consumidos,
requisitos de a11y y comportamiento de motion`. Es **introspectable**: un humano *o un agente* puede
ensamblar UI sabiendo exactamente qué expone cada pieza, sin adivinar. Plantilla de referencia:
`milpa-button.contract.json` y `milpa-input.contract.json`.

**Quality floor (obligatorio para que cualquier pieza pueda shippear):**
- Contraste **AA** (4.5 texto / 3:1 UI).
- Paridad **light/dark**.
- Paridad **reduced-motion**.
- Navegable por **teclado**, con `:focus-visible`.
- Label / `aria` correctos (`aria-invalid`, `aria-busy`, `aria-describedby`, etc.).

**Naming:** clases `mui-*`; tokens `--{categoría}-{nombre}`; contratos `{componente}.contract.json`.

**Orden de construcción:** foundations → primitivas → componentes → patterns → superficies. El par de
referencia (Button + Input) ya fija el patrón; el resto es repetición disciplinada bajo el mismo molde.

---

## 7. Cómo usar este documento

- **Para Claude Design / Claude Code:** este es el cerebro de marca. Los archivos de tokens y
  contratos son la **fuente legible por máquina**; este `DESIGN.md` es la **intención**. Construye con
  el alma y las reglas, no solo con los valores.
- **Para agentes:** los contratos son introspectables. Respeta el quality floor; no shippea nada que
  no lo cumpla.
- **Sobre los valores:** los hex y números son un *baseline*. Las **reglas** de la sección 3 y el
  quality floor son lo durable; el pulido visual fino se hace en el canvas, con ojo humano.

---

## Apéndice — mapa de archivos

| Archivo                          | Qué es                                            |
|----------------------------------|---------------------------------------------------|
| `tokens/milpa-tokens.json`        | **fuente de verdad** — tokens W3C DTCG (Style Dictionary/Tokens Studio) |
| `dist/milpa-tokens.css`           | salida CSS (dark-first + override light) — **generada** desde el JSON (`npm run build`), drift-gated en CI |
| `dist/tailwind.config.js`         | preset Tailwind: rampas + alias semánticos + radius/sombras/z/easings — **generado** |
| `scripts/build-tokens.mjs`        | generador de `dist/` (cero deps) + drift gate (`--check`) |
| `scripts/verify-governance.mjs`   | gate estructural: token-purity, contratos válidos y coherentes |
| `motion/milpa-motion.css`         | primitivas de motion + contrato reduced-motion    |
| `motion/milpa-motion.js`          | config de motion para GSAP / ScrollTrigger        |
| `proof/milpa-ds-proof.html`       | página de prueba visual (storybook v0)            |
| `proof/milpa-admin-proof.html`    | battle-test del panel admin (shell + componentes compuestos, dark/light) |
| `scripts/verify-contrast.mjs`     | gate WCAG AA (`npm test`) — tokens **y** pares que consumen los componentes (135 checks) |
| `primitives/milpa-primitives.css` | *el grano*: Button, Field, Input, Textarea, Select, Checkbox, Radio, Switch, Badge, Kbd, Avatar, Spinner, Progress, Divider — **el molde vive en el header del archivo** |
| `primitives/milpa-*.contract.json`| contratos de las primitivas (plantilla: `milpa-button.contract.json`) |
| `components/milpa-components.css` | *el frijol*: Tooltip, Menu, Card, Stat, Empty, Skeleton, Table, Pagination, Tabs, Breadcrumbs, Alert, Toast, Modal, Drawer, Shell, Sidebar, Topbar, PageHeader |
| `components/milpa-*.contract.json`| contratos de los componentes (comportamiento JS del consumidor en `a11y.behavior`) |
| `logo/*`                          | kit de logo: símbolo Grano, wordmark grano-i, lockups h/v, app icon (mono-oro) |

*Milpa · milpa.lat · getmilpa.com · milpahq.com*
