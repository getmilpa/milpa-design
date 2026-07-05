#!/usr/bin/env node
/**
 * verify-theme.mjs — validador de REFERENCIA para themes/skins inyectados
 * (THEMING.md §6). Valida un CSS de tokens contra theme.contract.json:
 *
 *   node scripts/verify-theme.mjs <skin.css>     (npm run verify:theme -- <skin.css>)
 *
 * Semántica de merge: un skin puede ser PARCIAL (nivel 1 — retokenizar un
 * subconjunto). Cada tema se resuelve como: valores del skin (bloques
 * :root / [data-theme="dark"] / [data-theme="light"]) sobre los defaults
 * de Milpa (tokens/milpa-tokens.json). Se validan TODOS los contrast.pairs
 * del contrato sobre la paleta resultante, en ambos temas. Sale 1 si algún
 * par falla.
 *
 * Además (Task 1 del contrato — `validation.form`): cualquier token NO-color
 * que el skin fije se valida por FORMA (tipo + no-vacío) contra su grupo de
 * `requiredTokens` — un `--dur-base: rojo` o un `--font-body:` vacío también
 * hacen fallar el gate. Solo se chequean los tokens que el skin efectivamente
 * fija (un skin parcial sigue siendo válido) y que pertenecen a un grupo
 * conocido; no se verifican magnitudes ni buen gusto.
 *
 * Limitación documentada: el contraste solo evalúa valores de color LITERALES
 * (--token:#RRGGBB, #RRGGBBAA, rgb()/rgba()) — es la referencia para `coa`;
 * no resuelve var() anidadas ni color-mix. Soporta alpha: una superficie
 * translúcida se compone sobre `--bg` (el invariante exige `--bg` opaco)
 * antes de medir el contraste efectivo — ver THEMING.md §6. Cero
 * dependencias, mismas fórmulas WCAG que verify-contrast.mjs.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file) { console.error('uso: node scripts/verify-theme.mjs <skin.css>'); process.exit(2); }

const contract = JSON.parse(readFileSync(join(root, 'theme.contract.json'), 'utf8'));
const tok = JSON.parse(readFileSync(join(root, 'tokens/milpa-tokens.json'), 'utf8'));
let css;
try { css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''); }
catch { console.error(`no pude leer ${file} — ¿la ruta existe?`); process.exit(2); }

// --- defaults de Milpa por tema (refs DTCG → hex) ---
const prim = (ref) => {
  const m = /^\{color\.([a-z]+)\.(\d+)\}$/.exec(ref);
  if (!m) throw new Error(`ref no soportada: ${ref}`);
  return tok.color[m[1]][m[2]].$value;
};
const defaults = {};
for (const theme of ['dark', 'light']) {
  defaults[theme] = {};
  for (const [name, node] of Object.entries(tok.theme[theme])) {
    if (name.startsWith('$')) continue;
    defaults[theme][name] = prim(node.$value);
  }
}

// --- parse del skin: bloques selector { --x:#hex; ... } ---
const skin = { base: {}, dark: {}, light: {} };
for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
  const sel = m[1];
  const buckets = [];
  if (/\[data-theme="?dark"?\]/.test(sel)) buckets.push('dark');
  if (/\[data-theme="?light"?\]/.test(sel)) buckets.push('light');
  if (/:root/.test(sel)) buckets.push('base');
  if (!buckets.length) continue;
  for (const d of m[2].matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b|rgba?\([^)]*\))/g)) {
    for (const b of buckets) skin[b][d[1]] = d[2].trim();
  }
}

// --- parse del skin (2ª pasada): TODAS las declaraciones --token: valor,
// no solo hex — para form-validar los tokens no-color que el skin fija ---
const setTokens = {};
for (const m of css.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
  const sel = m[1];
  const isThemeBlock = /\[data-theme="?(dark|light)"?\]/.test(sel) || /:root/.test(sel);
  if (!isThemeBlock) continue;
  for (const d of m[2].matchAll(/--([\w-]+)\s*:\s*([^;]+)/g)) {
    setTokens[d[1]] = d[2];
  }
}

// --- parseo de color: #RRGGBB, #RRGGBBAA, rgb()/rgba() → {r,g,b,a} ---
function parseColor(s) {
  s = s.trim();
  let m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/.exec(s);
  if (m) return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16), a: m[4] !== undefined ? parseInt(m[4],16)/255 : 1 };
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+%?))?\s*\)$/.exec(s);
  if (m) { const a = m[4] === undefined ? 1 : (m[4].endsWith('%') ? parseFloat(m[4])/100 : parseFloat(m[4])); return { r: +m[1], g: +m[2], b: +m[3], a }; }
  return null;
}

// --- composición alpha de una superficie translúcida sobre un fondo opaco
// (--bg, el invariante del contrato exige que sea opaco) ---
const compose = (c, base) => c.a >= 1 ? c : {
  r: Math.round(c.r * c.a + base.r * (1 - c.a)),
  g: Math.round(c.g * c.a + base.g * (1 - c.a)),
  b: Math.round(c.b * c.a + base.b * (1 - c.a)), a: 1,
};

// --- WCAG (idéntico a verify-contrast.mjs, ahora sobre {r,g,b} 0–255) ---
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Y = ({ r, g, b }) => { const [R, G, B] = [r / 255, g / 255, b / 255].map(lin); return 0.2126 * R + 0.7152 * G + 0.0722 * B; };
const CR = (f, b) => { const a = Y(f), c = Y(b), hi = Math.max(a, c), lo = Math.min(a, c); return (hi + 0.05) / (lo + 0.05); };

// --- paleta resuelta por tema: skin[tema] > skin.base > default ---
const resolve = (theme, name) => skin[theme][name] ?? skin.base[name] ?? defaults[theme][name];

// --- presencia (informativa): qué provee el skin vs qué hereda ---
const required = contract.requiredTokens.color.map((t) => t.replace(/^--/, ''));
const provided = required.filter((t) => t in skin.base || t in skin.dark || t in skin.light);
console.log(`skin: ${file}`);
console.log(`tokens de color: ${provided.length}/${required.length} provistos por el skin, ${required.length - provided.length} heredados de Milpa\n`);

// --- pares ---
let fails = 0, n = 0;
for (const theme of ['dark', 'light']) {
  // invariante del contrato: --bg es la referencia de composición y debe ser opaco.
  const bgRaw = resolve(theme, 'bg');
  const baseBg = parseColor(bgRaw);
  if (!baseBg) {
    console.log(`  [${theme[0].toUpperCase()}] ERROR --bg no es un color parseable: ${bgRaw}`);
    fails++;
  } else if (baseBg.a < 1) {
    console.log(`  [${theme[0].toUpperCase()}] FAIL invariante: --bg debe ser opaco — alpha=${baseBg.a} (${bgRaw})`);
    fails++;
  }
  for (const p of contract.contrast.pairs) {
    if (p.themes && !p.themes.includes(theme)) continue;
    const fgRaw = resolve(theme, p.fg.replace(/^--/, ''));
    const bgRawPair = resolve(theme, p.bg.replace(/^--/, ''));
    let fgC = parseColor(fgRaw);
    let bgC = parseColor(bgRawPair);
    if (!fgC || !bgC) {
      n++; fails++;
      console.log(`  [${theme[0].toUpperCase()}] ERROR color no parseable  ${p.fg}=${fgRaw} / ${p.bg}=${bgRawPair}`);
      continue;
    }
    // superficie translúcida → composición sobre --bg (o sobre el bg ya compuesto,
    // si el bg del par en sí es translúcido) antes de medir el contraste efectivo.
    if (bgC.a < 1) bgC = compose(bgC, baseBg ?? bgC);
    if (fgC.a < 1) fgC = compose(fgC, bgC);
    const c = CR(fgC, bgC);
    const ok = c >= p.min; n++; if (!ok) fails++;
    const touched = (skin[theme][p.fg.slice(2)] ?? skin.base[p.fg.slice(2)]) || (skin[theme][p.bg.slice(2)] ?? skin.base[p.bg.slice(2)]);
    if (!ok || touched) console.log(`  [${theme[0].toUpperCase()}] ${ok ? 'PASS' : 'FAIL'} ${c.toFixed(2)} (>=${p.min})  ${p.fg} / ${p.bg}`);
  }
}
// --- form validators por grupo (Task 1 del contrato: validation.form.types) ---
const LEN = /^-?(\d*\.?\d+)(px|rem|em|ch|vw|vh|%)$|^0$/;
const TIME = /^(\d*\.?\d+)(ms|s)$/;
const NUM = /^-?\d*\.?\d+$/;
const FUNC = /^(calc|min|max|clamp)\(.*\)$/;
const isLen = (v) => { v = v.trim(); return FUNC.test(v) || v.split(/\s+/).every((p) => LEN.test(p)); };
const groupOf = (tokName) => {
  for (const [g, list] of Object.entries(contract.requiredTokens)) {
    if (g === 'color') continue;
    if (list.includes('--' + tokName)) return g;
  }
  return null;
};
const wellFormed = (g, name, v) => {
  if (v === '' ) return false;
  if (g === 'type') {
    if (name.startsWith('font-')) return v.length > 0;               // familia no-vacía
    if (name.startsWith('leading-')) return NUM.test(v);
    if (name.startsWith('weight-')) return NUM.test(v) && +v >= 1 && +v <= 1000;
    return isLen(v);                                                  // text-*, tracking-*
  }
  if (g === 'space' || g === 'radius' || g === 'size') return isLen(v);
  if (g === 'zIndex') return /^-?\d+$/.test(v);
  if (g === 'motion') {
    if (name.startsWith('dur-') || name.startsWith('stagger-')) return TIME.test(v);
    if (name.startsWith('ease-')) return /^(linear|cubic-bezier\(|steps\()/.test(v);
    return isLen(v);                                                  // rise-*
  }
  if (g === 'elevation') return v.length > 0;
  return true;
};
let formFails = 0;
for (const [name, v] of Object.entries(setTokens)) {
  const g = groupOf(name);
  if (!g) continue;                                                   // token desconocido o color → lo maneja el gate de contraste
  if (!wellFormed(g, name, v.trim())) { formFails++; console.log(`  FORM FAIL  --${name}: ${v.trim()}  (grupo ${g})`); }
}

console.log(`\n${fails === 0 && formFails === 0 ? `ALL PASS ✓  (${n} checks de contraste, ${formFails} malformados — el skin honra el contrato)` : `${fails} FAILURES / ${n} de contraste, ${formFails} malformados — el skin NO honra el contrato`}`);
console.log('invariantes (no verificables acá — leé THEMING.md §5):');
for (const inv of contract.invariants) console.log(`  · ${inv}`);
process.exit(fails === 0 && formFails === 0 ? 0 : 1);
