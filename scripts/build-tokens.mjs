#!/usr/bin/env node
/**
 * build-tokens.mjs — genera las salidas consumibles desde la fuente de verdad
 * (tokens/milpa-tokens.json, DTCG):
 *
 *   dist/milpa-tokens.css       tokens CSS (dark-first + override light)
 *   dist/tailwind.config.js     preset Tailwind (rampas + alias semánticos)
 *
 * DECISIÓN T1: generador propio, cero dependencias — igual que los
 * verificadores. Style Dictionary quedó descartado: su default aplana
 * theme.dark.* (el manejo :root/[data-theme] pedía custom format de todos
 * modos) y no queremos install en CI. Se revisita si algún día hay salidas
 * multi-plataforma (iOS/Android/Figma).
 *
 * Modos:
 *   node scripts/build-tokens.mjs           escribe dist/
 *   node scripts/build-tokens.mjs --check   drift gate: falla si dist/ no
 *                                           coincide con lo que generaría
 *                                           el JSON (corre en CI)
 *
 * NOTA: textStyle.* (tipografía compuesta) no se emite a CSS a propósito —
 * vive en el JSON para herramientas; los estilos compuestos se arman con
 * los tokens sueltos (--font-*, --text-*, --leading-*, …).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PAIRS, INVARIANTS, LAYER_ORDER } from './contrast-pairs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tok = JSON.parse(readFileSync(join(root, 'tokens/milpa-tokens.json'), 'utf8'));

// ---------- helpers ----------
const ref2var = (v) => String(v).replace(/\{color\.([a-z]+)\.(\d+)\}/g, 'var(--$1-$2)');
const bezier = (arr) =>
  arr.join(',') === '0,0,1,1' ? 'linear' : `cubic-bezier(${arr.join(',')})`;
const entries = (obj) => Object.entries(obj).filter(([k]) => !k.startsWith('$'));
const val = (node) => node.$value;

// ---------- dist/milpa-tokens.css ----------
let css = `/* Milpa — design tokens. Dark-first.
   GENERADO desde tokens/milpa-tokens.json — NO editar a mano.
   Regenerar: npm run build · verificar: npm test · CI falla si driftea (--check).
   Dark = default (:root, y [data-theme="dark"]). Light = [data-theme="light"] en <html>.
   IMPORTANTE: <html> SIEMPRE lleva data-theme ("dark" | "light"); nunca ausente (para que
   las utilidades dark: de Tailwind matcheen el estado por defecto).
   Cascada: todo el CSS publicado vive en @layer milpa.* — el CSS sin layer del
   consumidor/plugin SIEMPRE gana (THEMING.md).
   Todos los pares texto/UI verificados WCAG AA (npm test). */

${LAYER_ORDER}

@layer milpa.tokens {

/* ===== color: primitives ===== */
:root {
`;
for (const [ramp, steps] of entries(tok.color)) {
  css += '  ' + entries(steps).map(([s, n]) => `--${ramp}-${s}:${val(n)};`).join(' ') + '\n';
}

css += `
  /* ===== type ===== */
`;
css += '  ' + entries(tok.fontFamily).map(([k, n]) => `--font-${k}:${val(n)};`).join(' ') + '\n';
css += '  --font-display:var(--font-heading);\n';
css += '  ' + entries(tok.fontSize).map(([k, n]) => `--text-${k}:${val(n)};`).join(' ') + '\n';
css += '  ' + entries(tok.lineHeight).map(([k, n]) => `--leading-${k}:${val(n)};`).join(' ') + '\n';
css += '  ' + entries(tok.fontWeight).map(([k, n]) => `--weight-${k}:${val(n)};`).join(' ') + '\n';
css += '  ' + entries(tok.letterSpacing).map(([k, n]) => `--tracking-${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== spacing ===== */
`;
css += '  ' + entries(tok.space).map(([k, n]) => `--space-${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== radius ===== */
`;
css += '  ' + entries(tok.radius).map(([k, n]) => `--radius-${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== z-index ===== */
`;
css += '  ' + entries(tok.zIndex).map(([k, n]) => `--z-${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== motion ===== */
`;
css += '  ' + entries(tok.duration).map(([k, n]) => `--dur-${k}:${val(n)};`).join(' ') + '\n';
css += '  ' + entries(tok.easing).map(([k, n]) => `--ease-${k}:${bezier(val(n))};`).join(' ') + '\n';
css += '  ' + entries(tok.stagger).map(([k, n]) => `--stagger-${k}:${val(n)};`).join(' ') + '\n';
css += '  ' + entries(tok.rise).map(([k, n]) => `--rise-${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== size ===== */
`;
css += '  ' + entries(tok.size).map(([k, n]) => `--${k}:${val(n)};`).join(' ') + '\n';

css += `
  /* ===== effect ===== */
`;
css += '  ' + entries(tok.effect).map(([k, n]) => `--${k}:${val(n)};`).join(' ') + '\n';
css += '}\n';

const themeBlock = (theme, selector, intro) => {
  let out = `\n${intro}\n${selector} {\n`;
  for (const [name, node] of entries(tok.theme[theme])) {
    out += `  --${name}:${ref2var(val(node))};\n`;
  }
  out += `  /* ===== elevation (${theme}) ===== */\n`;
  for (const [k, n] of entries(tok.elevation[theme])) {
    out += `  --shadow-${k}:${val(n)};\n`;
  }
  out += '}\n';
  return out;
};

css += themeBlock(
  'dark',
  ':root,\n[data-theme="dark"]',
  `/* ===== color: semantic — DARK (default) =====
   Se define en :root Y en [data-theme="dark"] para que funcione con o sin el atributo. */`
);
css += themeBlock(
  'light',
  '[data-theme="light"]',
  `/* ===== color: semantic — LIGHT =====
   Regla 2: los acentos se profundizan en light. El primario NO es fill dorado (el oro no
   contrasta como fill sobre crema) — es GHOST: borde var(--accent) + texto var(--accent-text). */`
);
css += '\n} /* @layer milpa.tokens */\n';

// ---------- dist/tailwind.config.js ----------
const q = (s) => `'${s}'`;
const rampLines = entries(tok.color)
  .map(([ramp, steps]) => `        ${ramp}: { ${entries(steps).map(([s, n]) => `${s}: ${q(val(n))}`).join(', ')} },`)
  .join('\n');
const aliasLines = entries(tok.theme.dark)
  .map(([name]) => `        '${name}': 'var(--${name})',`)
  .join('\n');
const kv = (obj, fmt = (v) => q(v)) =>
  entries(obj).map(([k, n]) => `        '${k}': ${fmt(val(n))},`).join('\n');

const tw = `/* Milpa — Tailwind theme. GENERADO desde tokens/milpa-tokens.json — NO editar a mano (npm run build).
   Import milpa-tokens.css so the var() colors & shadows resolve.
   NOTA darkMode: dark es el default (definido en :root y en [data-theme="dark"]). La
   convención es que <html> SIEMPRE lleve data-theme ("dark"|"light"); así el selector
   [data-theme="dark"] matchea el estado por defecto y las utilidades dark: disparan bien. */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
${rampLines}
        /* ===== alias semánticos (resuelven contra milpa-tokens.css) ===== */
${aliasLines}
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-heading)'],
      },
      fontSize: {
${kv(tok.fontSize)}
      },
      borderRadius: {
${kv(tok.radius)}
      },
      boxShadow: {
${entries(tok.elevation.dark).map(([k]) => `        '${k}': 'var(--shadow-${k})',`).join('\n')}
      },
      zIndex: {
${kv(tok.zIndex, (v) => q(String(v)))}
      },
      transitionDuration: {
${kv(tok.duration)}
      },
      transitionTimingFunction: {
${entries(tok.easing).map(([k, n]) => `        '${k}': ${q(bezier(val(n)))},`).join('\n')}
      },
    },
  },
};
`;

// ---------- theme.contract.json ----------
// El quality floor como contrato ejecutable: tokens requeridos + pares AA (de
// contrast-pairs.mjs) + invariantes. El framework (coa) valida themes de plugin
// contra esto al instalarlos. Drift-gated igual que dist/.
const themeContract = JSON.stringify({
  name: 'milpa-theme',
  layer: 'theme',
  summary: 'Contract every injected theme/skin must honor. Generated from tokens + contrast-pairs.mjs — do not edit by hand (npm run build).',
  cascade: {
    order: LAYER_ORDER,
    rule: 'All published Milpa CSS lives in @layer milpa.*. Un-layered (or later-layered) consumer/plugin CSS always wins — no !important, no specificity wars.',
    levels: [
      'L1 retokenize: override custom properties only (colors, type, radius, motion). Layout & a11y intact.',
      'L2 reskin: add your own un-layered CSS replacing any mui-* skin or adding components.',
      'L3 replace: skip Milpa component/artifact/layout bundles entirely; honor requiredTokens + contrast + invariants.',
    ],
  },
  requiredTokens: {
    color: entries(tok.theme.dark).map(([n]) => `--${n}`),
    type: [
      ...entries(tok.fontFamily).map(([k]) => `--font-${k}`),
      ...entries(tok.fontSize).map(([k]) => `--text-${k}`),
      ...entries(tok.lineHeight).map(([k]) => `--leading-${k}`),
      ...entries(tok.fontWeight).map(([k]) => `--weight-${k}`),
      ...entries(tok.letterSpacing).map(([k]) => `--tracking-${k}`),
    ],
    space: entries(tok.space).map(([k]) => `--space-${k}`),
    radius: entries(tok.radius).map(([k]) => `--radius-${k}`),
    zIndex: entries(tok.zIndex).map(([k]) => `--z-${k}`),
    motion: [
      ...entries(tok.duration).map(([k]) => `--dur-${k}`),
      ...entries(tok.easing).map(([k]) => `--ease-${k}`),
      ...entries(tok.stagger).map(([k]) => `--stagger-${k}`),
      ...entries(tok.rise).map(([k]) => `--rise-${k}`),
    ],
    elevation: entries(tok.elevation.dark).map(([k]) => `--shadow-${k}`),
    size: entries(tok.size).map(([k]) => `--${k}`),
    effect: entries(tok.effect).map(([k]) => `--${k}`),
  },
  validation: {
    hard: { contrast: 'WCAG AA pairs (contrast.pairs), gated by threshold in dark+light' },
    form: {
      note: 'Non-color tokens the skin sets are validated by FORM (type + non-empty), not by taste. Partial skins are valid.',
      types: {
        type: 'font-* = non-empty family list; text-*/tracking-* = <length>; leading-* = <number>; weight-* = <number 1-1000>',
        space: '<length>', radius: '<length>', zIndex: '<integer>',
        motion: 'dur-*/stagger-* = <time>; ease-* = <timing-function>; rise-* = <length>',
        elevation: 'non-empty <shadow>', size: '<length> (or <ratio> where applicable)',
        effect: 'border-style = keyword (solid|dashed|dotted|double|none|groove|ridge|inset|outset); blur-* = <length>; surface-backdrop = none | filter-function list',
      },
    },
  },
  contrast: {
    algorithm: 'WCAG 2.1 relative luminance',
    themes: ['dark', 'light'],
    pairs: PAIRS.map(([fg, bg, min, themes]) =>
      ({ fg: `--${fg}`, bg: `--${bg}`, min, ...(themes ? { themes } : {}) })),
  },
  invariants: INVARIANTS,
}, null, 2) + '\n';

// ---------- write / check ----------
const OUT = { 'dist/milpa-tokens.css': css, 'dist/tailwind.config.js': tw, 'theme.contract.json': themeContract };

if (process.argv.includes('--check')) {
  let drift = 0;
  for (const [file, content] of Object.entries(OUT)) {
    const disk = readFileSync(join(root, file), 'utf8');
    if (disk !== content) { drift++; console.log(`DRIFT ${file} — no coincide con tokens/milpa-tokens.json (corré npm run build)`); }
    else console.log(`OK    ${file}`);
  }
  process.exit(drift ? 1 : 0);
} else {
  for (const [file, content] of Object.entries(OUT)) {
    writeFileSync(join(root, file), content);
    console.log(`escrito ${file} (${content.length} bytes)`);
  }
}
