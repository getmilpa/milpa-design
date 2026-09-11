#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// (c) Rodrigo Vicente - TeamX Agency — https://teamx.agency
//
// design-sync pre-build generator for @milpa/design (a CSS-only design system).
//
// Claude Design's converter expects a React package; Milpa ships CSS classes +
// per-component JSON contracts instead. This script derives, deterministically
// and from the repo's own shipped files, the two inputs the converter consumes
// on its tokens-only path:
//
//   .design-sync/.cache/milpa.css            -> cfg.cssEntry   (all published CSS, layer order)
//   milpa-contracts/**/*.md                  -> cfg.guidelinesGlob (one doc per *.contract.json)
//
// Nothing here is hand-authored content: every line comes from tokens/, the
// five layered stylesheets, or a *.contract.json. Re-run before every sync
// (cfg.buildCmd does). Output is gitignored; this script is committed.

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.design-sync', '.cache');
const GUIDE = join(ROOT, 'milpa-contracts'); // root-level so the converter's guidelines/ dest path stays short (it preserves the package-relative path)
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

// ---------------------------------------------------------------------------
// 1. CSS entry: the package's published stylesheets, in @layer order.
//    Tokens (dist/milpa-tokens.css) are NOT concatenated here — they ship via
//    cfg.tokensGlob into tokens/ and styles.css @imports them from there.
//    Fonts: the DS expects the host to load Space Grotesk / Space Mono (every
//    proof/*.html and the landing do it via Google Fonts). A stylesheet may
//    only carry @import before other rules, so it goes first.
// ---------------------------------------------------------------------------
const FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');";
const CSS_ORDER = [
  'motion/milpa-motion.css',
  'primitives/milpa-primitives.css',
  'components/milpa-components.css',
  'artifacts/milpa-artifacts.css',
  'layouts/milpa-layouts.css',
];
mkdirSync(CACHE, { recursive: true });
const cssParts = [FONTS_IMPORT, `/* @milpa/design@${pkg.version} — concatenated by .design-sync/gen.mjs (${CSS_ORDER.join(', ')}) */`];
for (const rel of CSS_ORDER) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { console.error(`! gen: ${rel} missing`); process.exit(1); }
  cssParts.push(`\n/* ===== ${rel} ===== */\n${readFileSync(p, 'utf8')}`);
}
writeFileSync(join(CACHE, 'milpa.css'), cssParts.join('\n'));
console.error(`gen: milpa.css (${CSS_ORDER.length} stylesheets)`);

// ---------------------------------------------------------------------------
// 2. Guidelines: one markdown doc per contract + a catalog table.
// ---------------------------------------------------------------------------
const LAYERS = [
  ['primitives', 'primitive', 'el grano — primitivas'],
  ['components', 'component', 'el frijol — componentes admin + commerce'],
  ['artifacts', 'artifact', 'el elote — artefactos de contenido'],
  ['layouts', 'layout', 'la parcela — layouts'],
];

const esc = (s) => String(s ?? '');
const inline = (s) => esc(s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

// Generic renderer for the contract's free-form objects (anatomy, variants,
// states, a11y, motion): strings -> bullet, arrays -> bullets, objects -> nested.
function renderValue(v, depth = 0) {
  const pad = '  '.repeat(depth);
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return `${pad}- ${esc(v)}\n`;
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? renderValue(x, depth) : `${pad}- ${esc(x)}\n`)).join('');
  let out = '';
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'object' && val !== null) out += `${pad}- **${esc(k)}**\n${renderValue(val, depth + 1)}`;
    else out += `${pad}- **${esc(k)}** — ${esc(val)}\n`;
  }
  return out;
}

function section(title, v) {
  if (v == null || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Object.keys(v).length)) return '';
  return `\n## ${title}\n\n${renderValue(v)}`;
}

if (existsSync(GUIDE)) rmSync(GUIDE, { recursive: true, force: true });
mkdirSync(GUIDE, { recursive: true });

const catalog = [];
let nDocs = 0, nExamples = 0;
for (const [dir, layer, layerLabel] of LAYERS) {
  const files = readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.contract.json')).sort();
  mkdirSync(join(GUIDE, dir), { recursive: true });
  for (const f of files) {
    const c = JSON.parse(readFileSync(join(ROOT, dir, f), 'utf8'));
    const examples = (c.examples ?? []).map((e) => `### ${esc(e.title)}\n\n\`\`\`html\n${esc(e.html)}\n\`\`\``).join('\n\n');
    nExamples += (c.examples ?? []).length;
    const md = `# \`.${esc(c.class)}\` — ${esc(c.name)}

> Layer: **${esc(c.layer)}** (${layerLabel}) · status: ${esc(c.status)} · contract v${esc(c.version)} · source: \`${dir}/${f}\`

${esc(c.summary)}

## Element

${renderValue(c.element)}${c.composes ? `\n## Composes\n\n${renderValue(c.composes)}` : ''}${section('Anatomy (classes)', c.anatomy)}${section('Variants (modifier classes)', c.variants)}${section('States', c.states)}${section('Accessibility', c.a11y)}${section('Motion', c.motion)}
## Tokens consumed

${(c.tokens ?? []).map((t) => `\`${esc(t)}\``).join(', ')}
${examples ? `\n## Examples (verbatim from the contract)\n\n${examples}\n` : ''}`;
    writeFileSync(join(GUIDE, dir, `${c.name}.md`), md);
    catalog.push({ dir, layer, name: c.name, cls: c.class, status: c.status, summary: c.summary });
    nDocs++;
  }
}

const catalogMd = `# Milpa component catalog (${catalog.length} contracts, @milpa/design@${pkg.version})

Every Milpa component is a **CSS class family** (\`.mui-*\`) applied to plain HTML/JSX elements —
there are no React components to import. Each row links to the contract-derived doc with the
full class anatomy, modifier classes, states, a11y rules and verbatim HTML examples.

${LAYERS.map(([dir, layer, label]) => {
  const rows = catalog.filter((c) => c.dir === dir);
  return `## ${label} (\`${dir}/\`)

| class | name | status | summary |
|---|---|---|---|
${rows.map((c) => `| \`.${c.cls}\` | [${c.name}](./${dir}/${c.name}.md) | ${c.status} | ${inline(c.summary).slice(0, 160)}${c.summary.length > 160 ? '…' : ''} |`).join('\n')}`;
}).join('\n\n')}
`;
writeFileSync(join(GUIDE, 'catalog.md'), catalogMd);
console.error(`gen: guidelines — ${nDocs} contract docs (${nExamples} examples) + catalog.md → ${GUIDE}`);
