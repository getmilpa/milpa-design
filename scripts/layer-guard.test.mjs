import assert from 'node:assert/strict';
import { firstUnlayeredRule } from './layer-guard.mjs';

const ORDER = '@layer milpa.tokens, milpa.components, milpa.layouts;';

// positive: everything wrapped → no leftover
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts {\n  .a { color: var(--text); }\n}`, 'milpa.layouts'),
  '',
  'fully-wrapped file should report no unlayered rule',
);

// nested @media inside the layer is still "inside"
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts {\n  @media (max-width: 880px) { .a { color: var(--text); } }\n}`, 'milpa.layouts'),
  '',
  'rules under @media inside the layer are layered',
);

// reopened layer (two blocks) is legal — both are inside
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts { .a{color:var(--text)} }\n@layer milpa.layouts { .b{color:var(--text)} }`, 'milpa.layouts'),
  '',
  'a reopened @layer block is still inside the layer',
);

// negative: a rule after the closing brace leaks un-layered
const leaked = firstUnlayeredRule(
  `${ORDER}\n@layer milpa.layouts { .a{color:var(--text)} }\n.leaked { color: var(--text); }`,
  'milpa.layouts',
);
assert.ok(leaked.includes('.leaked'), 'a rule outside the layer must be reported');

// braces inside comments/strings must not fool the walk
assert.equal(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts { .a::before{content:"}"} /* } */ }`, 'milpa.layouts'),
  '',
  'braces in strings/comments are ignored',
);

// unbalanced layer block (no closing brace) must not report clean
assert.ok(
  firstUnlayeredRule(`${ORDER}\n@layer milpa.layouts { .a{color:var(--text)}`, 'milpa.layouts') !== '',
  'an unbalanced @layer block must not report clean',
);

console.log('layer-guard: ALL PASS');
