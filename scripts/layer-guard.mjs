/**
 * layer-guard.mjs — side-effect-free brace-walk for the @layer gate.
 * Confirms EVERY style rule in a published CSS file lives inside its own
 * `@layer <name> { … }` wrapper. A substring check only proves the wrapper
 * exists; this proves nothing leaked out after a closing brace.
 * Zero deps, no top-level side effects (so verify-governance.mjs can import it
 * without triggering its process.exit — same reason LAYER_ORDER lives apart).
 */
const stripInert = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')                 // comments
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""'); // string contents

/** Returns leftover CSS containing an unlayered rule, or '' if all rules are layered. */
export function firstUnlayeredRule(rawCss, layerName) {
  let css = stripInert(rawCss);
  const marker = `@layer ${layerName} {`;
  // remove each balanced `@layer <name> { … }` block (a layer may be reopened)
  let idx;
  while ((idx = css.indexOf(marker)) !== -1) {
    let depth = 0, end = -1;
    for (let i = idx + marker.length - 1; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) { end = i; break; }
    }
    if (end === -1) return '<<unbalanced @layer block>>';
    css = css.slice(0, idx) + css.slice(end + 1);
  }
  // allowed at depth 0: @layer statement list, @import, @charset (all end in ;)
  css = css.replace(/@(?:layer|import|charset)\b[^;{}]*;/g, '');
  // any remaining brace means a style/at-rule block lives outside the layer
  return css.includes('{') ? css.trim() : '';
}
