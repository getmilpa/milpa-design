#!/usr/bin/env node
/**
 * verify-theme.test.mjs — regresión del form-gate (THEMING.md §6): el
 * form-gate no tenía guarda de regresión, así que un cambio que rompiera
 * verify-theme.mjs podía pasar `npm test` en silencio. Corre las dos
 * fixtures ya existentes en proof/skins/ contra el binario real (spawn,
 * no import) y afirma el exit code que documentan THEMING.md §6 y los
 * comentarios de cada fixture:
 *
 *   - broken-skin.css         → 3 tokens mal formados → exit 1 (FAIL)
 *   - valid-partial-skin.css  → skin parcial bien formado → exit 0 (PASS)
 *
 * Cero deps: child_process.spawnSync, mismo estilo que layer-guard.test.mjs.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bin = join(root, 'scripts/verify-theme.mjs');

function run(skin) {
  const { status } = spawnSync(process.execPath, [bin, join(root, 'proof/skins', skin)], {
    encoding: 'utf8',
  });
  return status;
}

const cases = [
  { skin: 'broken-skin.css', expect: 1, why: '3 tokens mal formados debe fallar el gate' },
  { skin: 'valid-partial-skin.css', expect: 0, why: 'skin parcial bien formado debe pasar el gate' },
];

let failures = 0;
for (const { skin, expect, why } of cases) {
  const status = run(skin);
  if (status === expect) {
    console.log(`PASS — ${skin}: exit ${status} (${why})`);
  } else {
    failures++;
    console.error(`FAIL — ${skin}: exit ${status}, esperaba ${expect} (${why})`);
  }
}

if (failures > 0) {
  console.error(`verify-theme.test: ${failures} fixture(s) fuera de contrato`);
  process.exit(1);
}
console.log('verify-theme.test: ALL PASS');
