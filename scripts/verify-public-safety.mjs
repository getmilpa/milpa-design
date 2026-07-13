#!/usr/bin/env node
// Gate anti-marca-vieja — regla CERO marca vieja publica (Rod, 2026-07-13).
// Los patrones se construyen por fragmentos para que este archivo jamas contenga
// la marca literal (y no se cace a si mismo). Lee el INDICE (git show :file):
// valida lo que se commitearia. Encadenado a npm test y prepublishOnly.
import { execSync } from 'node:child_process';

const SELF = 'scripts/verify-public-safety.mjs';
const m1 = 'med' + 'usa';
const m2 = 'tim' + 'ored';
const m3 = 'm' + 'ds';
const patterns = [
  { re: new RegExp(m1, 'i'), label: 'marca-1' },
  { re: new RegExp(m2, 'i'), label: 'marca-2' },
  { re: new RegExp(`(?:php\\s+${m3}\\b|\\b${m3}\\s+(?:make|serve|list)|\\\\${m3}\\\\)`), label: 'binario-viejo' },
];
const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(f => f && f !== SELF);
let fails = 0;
for (const file of tracked) {
  let body;
  try { body = execSync(`git show :"${file.replace(/"/g, '\\"')}"`, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }); }
  catch { continue; }
  body.split('\n').forEach((line, i) => {
    for (const { re, label } of patterns) {
      if (re.test(line)) { console.error(`PUBLIC-SAFETY FAIL [${label}] ${file}:${i + 1}: ${line.trim().slice(0, 120)}`); fails++; }
    }
  });
}
if (fails > 0) { console.error(`\n${fails} hit(s) de marca vieja — la regla es CERO.`); process.exit(1); }
console.log('OK: cero marca vieja en archivos tracked.');
