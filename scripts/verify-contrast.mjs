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
  // --- pares de componentes (primitives/components los consumen así) ---
  ['text-on-accent', 'accent-hover', 4.5, ['dark']], ['text-on-accent', 'accent-active', 4.5, ['dark']],
  ['on-secondary', 'secondary-hover', 4.5], ['on-secondary', 'secondary-active', 4.5],
  ['on-danger', 'danger-hover', 4.5], ['on-danger', 'danger-active', 4.5],
  ['border-strong', 'surface', 3], ['focus', 'surface', 3],
  ['text', 'surface', 4.5], // form-extras: textarea/select [readonly] (fondo surface) y texto sobre surface
  ['accent', 'surface', 3], // nav-bits: indicador de tab (subrayado oro) sobre surface
  ['accent-text', 'surface', 4.5], ['secondary-text', 'surface', 4.5],
  ['success', 'surface', 4.5], ['warning', 'surface', 4.5],
  ['danger', 'surface', 4.5], ['info', 'surface', 4.5],
  ['accent-text', 'accent-subtle', 4.5], ['secondary-text', 'secondary-subtle', 4.5],
  ['text', 'accent-subtle', 4.5], // data: fila seleccionada de .mui-table (tr[aria-selected] → td accent-subtle + text)
  ['accent', 'accent-subtle', 3], // data: borde de .mui-pagination__item[aria-current="page"] sobre su propio tinte
  ['text-secondary', 'surface-raised', 4.5], ['text', 'surface-raised', 4.5],
  // --- display-bits: Badge semántico (texto de color sobre su tinte *-bg) ---
  ['success', 'success-bg', 4.5], ['warning', 'warning-bg', 4.5],
  ['danger', 'danger-bg', 4.5], ['info', 'info-bg', 4.5],
  ['accent-active', 'accent-subtle', 3], // display-bits: borde de .mui-badge--accent sobre su tinte
  // --- display-bits: fill de .mui-progress sobre su track (surface-raised) ---
  ['accent', 'surface-raised', 3], ['success', 'surface-raised', 3],
  ['warning', 'surface-raised', 3], ['danger', 'surface-raised', 3],
  // --- feedback-overlays: Alert — cuerpo y acciones sobre los tintes *-bg
  //     (X/X-bg 4.5 ya cubierto arriba por display-bits: ícono/título del alert) ---
  ['text', 'success-bg', 4.5], ['text', 'warning-bg', 4.5],
  ['text', 'danger-bg', 4.5], ['text', 'info-bg', 4.5],
  ['text-secondary', 'success-bg', 4.5], ['text-secondary', 'warning-bg', 4.5],
  ['text-secondary', 'danger-bg', 4.5], ['text-secondary', 'info-bg', 4.5],
  ['border-strong', 'success-bg', 3], ['border-strong', 'warning-bg', 3], // boundary de .mui-btn outline en __actions
  ['border-strong', 'danger-bg', 3], ['border-strong', 'info-bg', 3],
  // --- feedback-overlays: Toast — texto, barra semántica y acciones sobre overlay ---
  ['text', 'overlay', 4.5], ['text-secondary', 'overlay', 4.5],
  ['success', 'overlay', 3], ['warning', 'overlay', 3],
  ['danger', 'overlay', 3], ['info', 'overlay', 3],
  ['secondary', 'overlay', 3], ['accent', 'overlay', 3], // boundary de --secondary/--primary en __action
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
