#!/usr/bin/env node
/**
 * verify-contrast.mjs — quality gate: comprueba WCAG AA de todos los pares texto/UI del sistema,
 * leyendo los valores reales de tokens/milpa-tokens.json (DTCG). Sin dependencias.
 * Sale con código 1 si algún par falla → sirve como test de CI.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tok = JSON.parse(readFileSync(join(root, 'tokens/milpa-tokens.json'), 'utf8'));

// --- resolver DTCG: theme.<t>.<role> = "{color.ramp.step}" -> hex primitivo ---
const prim = (ref) => {
  const m = /^\{color\.([a-z]+)\.(\d+)\}$/.exec(ref);
  if (!m) throw new Error(`ref no soportada: ${ref}`);
  return tok.color[m[1]][m[2]].$value;
};
const role = (theme, name) => prim(tok.theme[theme][name].$value);

// --- WCAG ---
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Y = (h) => { const [r, g, b] = hx(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const CR = (f, b) => { const a = Y(f), c = Y(b), hi = Math.max(a, c), lo = Math.min(a, c); return (hi + 0.05) / (lo + 0.05); };

// [ fg-role, bg-role, min, themes? ]  (bg-role resuelto desde el mismo tema)
// `themes` opcional restringe el par a ciertos temas. `text-on-accent/accent` = fill dorado, SOLO
// en dark: en light el primario es ghost (sin fill oro), cubierto por accent-text/bg + accent/bg.
const PAIRS = [
  ['text', 'bg', 4.5], ['text-secondary', 'bg', 4.5], ['text-muted', 'bg', 4.5],
  ['text-secondary', 'surface', 4.5], ['text-muted', 'surface', 4.5],
  ['accent-text', 'bg', 4.5], ['text-on-accent', 'accent', 4.5, ['dark']],
  ['secondary-text', 'bg', 4.5], ['on-secondary', 'secondary', 4.5],
  ['success', 'bg', 4.5], ['warning', 'bg', 4.5], ['danger', 'bg', 4.5],
  ['on-danger', 'danger', 4.5], ['info', 'bg', 4.5],
  ['border', 'bg', 3], ['border-strong', 'bg', 3], ['focus', 'bg', 3], ['accent', 'bg', 3],
];

let fails = 0, n = 0;
for (const theme of ['dark', 'light']) {
  for (const [fg, bg, min, themes] of PAIRS) {
    if (themes && !themes.includes(theme)) continue;
    const c = CR(role(theme, fg), role(theme, bg));
    const ok = c >= min; n++; if (!ok) fails++;
    console.log(`  [${theme[0].toUpperCase()}] ${ok ? 'PASS' : 'FAIL'} ${c.toFixed(2)} (>=${min})  ${fg} / ${bg}`);
  }
}
console.log(`\n${fails === 0 ? `ALL PASS ✓  (${n} checks)` : `${fails} FAILURES / ${n}`}`);
process.exit(fails === 0 ? 0 : 1);
