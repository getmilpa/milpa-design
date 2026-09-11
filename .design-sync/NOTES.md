# design-sync notes — @milpa/design

Repo-specific facts a re-sync needs. The design-agent-facing header lives in `conventions.md`; this
file is for everything else.

## `config.json` is local and never versioned

`.design-sync/config.json` holds the id of the Claude Design project this system syncs to, and this
repository is public. The id is not a credential, but publishing it cannot be undone — so the file is
gitignored and each machine that re-syncs creates its own. `gen.mjs` does not read it; only the re-sync
tool below does, so the generator runs without it.

Recreate it before a re-sync, with your own project id:

```json
{
  "projectId": "<your Claude Design project id>",
  "pkg": "@milpa/design",
  "globalName": "MilpaDesign",
  "shape": "package",
  "buildCmd": "npm run build && node .design-sync/gen.mjs",
  "cssEntry": ".design-sync/.cache/milpa.css",
  "tokensPkg": "@milpa/design",
  "tokensGlob": "dist/*.css",
  "guidelinesGlob": ["DESIGN.md", "THEMING.md", "milpa-contracts/**/*.md"],
  "readmeHeader": ".design-sync/conventions.md"
}
```

## Shape of this repo (why the sync looks the way it does)

- **CSS-only design system — zero React.** 76 `.mui-*` class families in five `@layer milpa.*`
  stylesheets + 72 `*.contract.json` (with 143 verbatim HTML examples). The converter runs its
  **tokens-only path** (`[ZERO_MATCH] … treating as tokens-only DS` is expected, not an error):
  `styles.css` → `tokens/milpa-tokens.css` + `_ds_bundle.css`, no component cards, no `.d.ts`.
- **No React wrappers were written on purpose** — that would be a reimplementation, not the
  shipped package. If a real React package ever ships (e.g. `@milpa/react`), re-sync with that
  as the entry and the component-card path lights up; until then the agent builds with classes.
- `--entry ./motion/milpa-motion.js` — the package's only JS export (`motion` config). It's a
  real shipped file (`exports["./motion"]`), so `window.MilpaDesign.motion` is honest.
- `.design-sync/gen.mjs` (committed) runs BEFORE the converter (`cfg.buildCmd` chains it) and
  derives two inputs from shipped files only:
  - `.design-sync/.cache/milpa.css` = Google-Fonts `@import` + motion/primitives/components/
    artifacts/layouts CSS in layer order → `cfg.cssEntry`. Tokens are NOT concatenated (they
    reach `tokens/` via `cfg.tokensGlob: "dist/*.css"`).
  - `milpa-contracts/**/*.md` (root-level, gitignored) = one doc per contract + `catalog.md` →
    `cfg.guidelinesGlob`. Root-level because the converter preserves the package-relative path
    under `guidelines/` (a `.design-sync/.cache/…` source would upload as
    `guidelines/.design-sync/.cache/…`).
- Fonts: Space Grotesk / Space Mono are host-loaded (every `proof/*.html` and the landing use
  the same Google Fonts URL). The `@import url(fonts.googleapis.com…)` at the top of the css
  entry makes validate print `[FONT_REMOTE]` — expected. Nothing is shipped in `fonts/`.
- The generated README body is React boilerplate ("All 0 components…", `window.MilpaDesign.*`
  mount snippet) with no trim knob. `conventions.md` is prepended and states up front that there
  are no React components — keep that paragraph first if you edit the header.

## Toolchain (recreate per clone — all gitignored)

```sh
mkdir -p .ds-sync && cp -r <skill>/package-build.mjs <skill>/package-validate.mjs <skill>/package-capture.mjs <skill>/resync.mjs <skill>/lib <skill>/storybook .ds-sync/
echo '{"name":"ds-sync-deps","private":true}' > .ds-sync/package.json
(cd .ds-sync && npm i esbuild ts-morph @types/react react react-dom playwright@1.61.0)
mkdir -p .ds-sync/node_modules/@milpa && ln -sfn ../../.. .ds-sync/node_modules/@milpa/design   # tokensPkg resolves through node_modules
```

- `--node-modules .ds-sync/node_modules` (the repo has no deps/lockfile; nothing to install at
  the root — `npm run build` only needs node).
- The `@milpa/design` symlink is what lets `cfg.tokensPkg: "@milpa/design"` copy
  `dist/milpa-tokens.css` into `tokens/`.
  **Any `npm i` inside `.ds-sync/` prunes that symlink as extraneous** — the build then dies with
  `ENOENT …/.ds-sync/node_modules/@milpa/design/package.json`. Re-run the `ln -sfn` line after
  every install (it's last in the block above for that reason).
- playwright **1.61.0** pins chromium **1228**, already in `~/.cache/ms-playwright/` on Rod's
  machine (no download). On another machine: install whichever playwright matches a cached
  build, or `npx playwright install chromium`.

## Re-sync (one command after the toolchain exists)

Needs a local `.design-sync/config.json` first — see the section above.

```sh
npm run build && node .design-sync/gen.mjs
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules .ds-sync/node_modules \
  --entry ./motion/milpa-motion.js --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

(`remote-sync.json` = `DesignSync(get_file, "_ds_sync.json")` from project
`5e366e28-419b-4e60-ac10-8c02d3ba803b`, "Milpa Design".) With no components the verdict has
nothing to grade; upload whenever `upload.any` is true (styling/guidelines/README changed).

## Known render warns (triaged — not new)

- `tokens: 281 defined, 229 referenced (2 missing, below threshold)` — the "missing" ones are
  `--X` and `--viz-N` (placeholders inside CSS comments) and `--_pipeline-progress` (a
  consumer-set private property read with a `, 0` fallback). Not bugs.
- `[DTS_REACT] @types/react not found` — the converter probes the package's own node_modules;
  irrelevant with 0 `.d.ts` components.
- `[ZERO_MATCH] … tokens-only DS`, `[FONT_REMOTE]`, `render check: 0/0 previews` — all expected.

## Re-sync risks

- **Contract schema drift.** `gen.mjs` renders `anatomy/variants/states/a11y/motion` with a
  generic nested-bullet renderer, so new keys or deeper nesting still render — but a renamed
  top-level field (`examples`, `class`, `layer`) needs a matching edit in `gen.mjs`.
- **New layer / stylesheet.** A sixth published stylesheet must be added to BOTH `CSS_ORDER`
  and `LAYERS` in `gen.mjs`, in `@layer` order.
- **Google Fonts URL** in `gen.mjs` mirrors `proof/*.html`; if the brand fonts change, update
  it (or switch to `cfg.extraFonts` if woff2 files are ever added to the repo).
- **`conventions.md` names classes and tokens by hand.** Every name was grep-verified against
  `ds-bundle/_ds_bundle.css` + `tokens/milpa-tokens.css` at authoring time; re-verify after any
  class rename (`.mui-empty`, `.mui-stat__delta--up`, `--space-32` are the kind of thing that
  silently rots).
- **`index.html` / `.ga4-report.md` / `.wrangler/`** at the repo root were untracked before the
  sync and are unrelated to it — left alone.
