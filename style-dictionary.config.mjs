/**
 * Style Dictionary — build de tokens DTCG (tokens/milpa-tokens.json) a salidas consumibles.
 *
 * NOTA (T1 del HANDOFF): por ahora escribe a `build/generated/` para NO pisar el `dist/`
 * hand-authored que ya está verificado AA (32/32). El manejo de temas (`:root` vs
 * `[data-theme="light"]`) NO lo resuelve la config default de SD (aplana `theme.dark.*` →
 * `--theme-dark-*`). Decidir en T1: mantener el semántico hand-authored, o custom SD con
 * filtros por tema. Requiere `npm i -D style-dictionary` (v4).
 */
export default {
  source: ['tokens/milpa-tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'build/generated/',
      files: [{ destination: 'milpa.primitives.css', format: 'css/variables' }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'build/generated/',
      files: [{ destination: 'milpa.tokens.js', format: 'javascript/es6' }],
    },
    json: {
      transformGroup: 'js',
      buildPath: 'build/generated/',
      files: [{ destination: 'milpa.tokens.flat.json', format: 'json/flat' }],
    },
  },
};
