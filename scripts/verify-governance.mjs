#!/usr/bin/env node
/**
 * verify-governance.mjs — quality gate estructural (complementa verify-contrast.mjs).
 * Verifica que el CSS publicado respete el molde (DESIGN §6 + header de
 * milpa-primitives.css) y que cada contrato sea JSON válido y coherente.
 * Sin dependencias. Sale con código 1 si algo falla → test de CI.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LAYER_ORDER } from './contrast-pairs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_FILES = ['primitives/milpa-primitives.css', 'components/milpa-components.css', 'artifacts/milpa-artifacts.css', 'layouts/milpa-layouts.css'];
const CONTRACT_DIRS = ['primitives', 'components', 'artifacts', 'layouts'];

// Regla @layer: todo CSS publicado declara el orden canónico completo y envuelve
// sus reglas en su propia capa (THEMING.md). dist/ lo garantiza el generador+drift.
const LAYERED = {
  'motion/milpa-motion.css': 'milpa.motion',
  'primitives/milpa-primitives.css': 'milpa.primitives',
  'components/milpa-components.css': 'milpa.components',
  'artifacts/milpa-artifacts.css': 'milpa.artifacts',
  'layouts/milpa-layouts.css': 'milpa.layouts',
};

let fails = 0;
const fail = (msg) => { fails++; console.log(`  FAIL ${msg}`); };
const pass = (msg) => console.log(`  PASS ${msg}`);

// tokens definidos (la fuente CSS consumible)
const tokensCss = readFileSync(join(root, 'dist/milpa-tokens.css'), 'utf8');
const defined = new Set([...tokensCss.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]));

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

for (const file of CSS_FILES) {
  const raw = readFileSync(join(root, file), 'utf8');
  const css = stripComments(raw);
  console.log(`\n${file}`);

  // llaves balanceadas (sanidad de sintaxis)
  const open = (css.match(/{/g) || []).length, close = (css.match(/}/g) || []).length;
  open === close ? pass(`llaves balanceadas (${open})`) : fail(`llaves desbalanceadas ${open}/${close}`);

  // token-purity: sin colores literales
  const hex = css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g);
  hex ? fail(`color literal: ${[...new Set(hex)].join(', ')}`) : pass('sin hex/rgb/hsl literales');

  // sin rampas primitivas (los componentes consumen SOLO semánticos)
  const ramp = css.match(/var\(--(?:tierra|oro|olivo|cielo|success|warning|danger)-\d+/g);
  ramp ? fail(`token de rampa primitiva: ${[...new Set(ramp)].join(', ')}`) : pass('sin rampas primitivas');

  // sin !important ni z-index crudo ni duraciones hardcodeadas
  css.includes('!important') ? fail('usa !important') : pass('sin !important');
  const zRaw = css.match(/z-index:\s*-?\d+/g);
  zRaw ? fail(`z-index crudo: ${[...new Set(zRaw)].join(', ')}`) : pass('z-index solo por tokens');
  const durRaw = css.match(/(?:animation|transition)[^;{]*\b\d+(?:\.\d+)?m?s\b/g);
  durRaw ? fail(`duración hardcodeada: ${[...new Set(durRaw)].join(' | ')}`) : pass('motion solo por tokens');

  // toda var() usada existe (en tokens, definida localmente, o privada --_)
  const local = new Set([...css.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]));
  const missing = new Set();
  for (const m of css.matchAll(/var\(--([\w-]+)/g)) {
    const t = m[1];
    if (!defined.has(t) && !local.has(t) && !t.startsWith('_')) missing.add(t);
  }
  missing.size ? fail(`var() inexistentes: ${[...missing].join(', ')}`) : pass('todas las var() existen');
}

// @layer: declaración canónica + wrap propio en cada CSS publicado
console.log('\n@layer');
for (const [file, layer] of Object.entries(LAYERED)) {
  const raw = readFileSync(join(root, file), 'utf8');
  raw.includes(LAYER_ORDER) ? pass(`${file}: declara el orden canónico`) : fail(`${file}: falta la declaración @layer canónica`);
  raw.includes(`@layer ${layer} {`) ? pass(`${file}: envuelto en @layer ${layer}`) : fail(`${file}: no envuelve sus reglas en @layer ${layer}`);
}

// contratos: JSON válido + campos requeridos + tokens declarados existentes
const REQUIRED = ['name', 'layer', 'version', 'class', 'summary', 'states', 'tokens', 'a11y'];
let nContracts = 0;
for (const dir of CONTRACT_DIRS) {
  for (const f of readdirSync(join(root, dir)).filter((f) => f.endsWith('.contract.json'))) {
    nContracts++;
    const path = `${dir}/${f}`;
    let c;
    try { c = JSON.parse(readFileSync(join(root, dir, f), 'utf8')); }
    catch (e) { fail(`${path}: JSON inválido — ${e.message}`); continue; }
    const missing = REQUIRED.filter((k) => !(k in c));
    if (missing.length) { fail(`${path}: faltan campos ${missing.join(', ')}`); continue; }
    const ghost = (c.tokens || []).filter((t) => !defined.has(String(t).replace(/^--/, '')) && !String(t).replace(/^--/, '').startsWith('_'));
    ghost.length ? fail(`${path}: declara tokens inexistentes ${ghost.join(', ')}`) : null;
  }
}
console.log(`\ncontratos: ${nContracts} revisados`);

console.log(`\n${fails === 0 ? 'ALL PASS ✓  (governance)' : `${fails} FAILURES (governance)`}`);
process.exit(fails === 0 ? 0 : 1);
