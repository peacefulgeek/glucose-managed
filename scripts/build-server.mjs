/**
 * Build server-side TypeScript files using esbuild
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// Resolve react-helmet-async ESM path
const helmetEsmPath = path.join(ROOT, 'node_modules/react-helmet-async/lib/index.esm.js');

async function buildServer() {
  console.log('[build] Building server...');

  await build({
    entryPoints: [
      path.join(ROOT, 'server/index.ts'),
      path.join(ROOT, 'server/ssr.ts'),
    ],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outdir: path.join(ROOT, 'dist/server'),
    packages: 'external',
    sourcemap: false,
    mainFields: ['module', 'main'],
    conditions: ['import', 'module', 'require', 'default'],
    // Alias react-helmet-async to its ESM version to avoid CJS named export issues
    alias: {
      'react-helmet-async': helmetEsmPath,
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    banner: {
      js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);
`,
    },
  });

  console.log('[build] Server build complete');
}

buildServer().catch(err => {
  console.error('[build] Error:', err);
  process.exit(1);
});
