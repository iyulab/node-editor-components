import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * `virtual:monaco-structure-css` — monaco's structural stylesheet as a string, resolved at
 * **this package's** build time and baked into the output.
 *
 * Why not import it from the consumer's monaco: `u-code-editor` renders monaco inside a shadow
 * root, so it needs the CSS *text* (`unsafeCSS`), not a stylesheet injected into the document.
 * monaco 0.56 added an `exports` map that rewrites every subpath to `./esm/vs/*.js`, so the
 * file that holds that text (`min/vs/editor/editor.main.css`) can no longer be named from
 * outside the package — a consumer's bundler fails to resolve it, which is how 0.4.x broke on
 * 0.56. The file still exists; only the map hides it. Reading it here, next to our own installed
 * monaco, sidesteps the map entirely and removes the last monaco path a consumer had to resolve.
 *
 * The trade-off is version skew: the baked CSS is the structure of the monaco *we* build with,
 * while the runtime is the one the consumer installed. The peer range keeps both inside one
 * minor, where the structural rules do not move.
 */
export const MONACO_STRUCTURE_CSS_ID = 'virtual:monaco-structure-css';

const RESOLVED_ID = '\0' + MONACO_STRUCTURE_CSS_ID;

/** Package root of the monaco-editor this build resolves — walks up from whatever `main`/`exports` gave. */
export function monacoRoot(): string {
  const require = createRequire(import.meta.url);
  let dir = dirname(require.resolve('monaco-editor'));
  for (;;) {
    const manifest = join(dir, 'package.json');
    if (existsSync(manifest)) {
      try {
        if (JSON.parse(readFileSync(manifest, 'utf8')).name === 'monaco-editor') return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) throw new Error('monaco-editor package root not found');
    dir = parent;
  }
}

export function monacoStructureCss(): Plugin {
  return {
    name: 'monaco-structure-css',
    resolveId(id) {
      return id === MONACO_STRUCTURE_CSS_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      const css = readFileSync(join(monacoRoot(), 'min', 'vs', 'editor', 'editor.main.css'), 'utf8');
      return `export default ${JSON.stringify(css)};`;
    },
  };
}
