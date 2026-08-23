// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * The canonical origin differs per environment, so the build reads it rather
 * than hardcoding it. deploy.yml builds this from the SITE_DOMAIN repository
 * variable, which keeps changing the domain a settings change rather than a code
 * change. Falls back to the dev server for `astro dev`.
 */
const site = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

/**
 * Contentful inspector mode: click rendered content inside the preview pane and
 * land on the field behind it. The `data-contentful-*` attributes come from
 * `editable()` in src/lib/preview.ts; this loads the SDK that acts on them.
 *
 * Registered conditionally rather than rendered conditionally. A component whose
 * `<script>` is gated behind `{IS_PREVIEW && ...}` still has that script hoisted
 * and bundled — tens of kB of SDK emitted into a production `dist/` that never
 * references it, and `deploy.yml` uploads whatever is in `dist/`.
 */
function inspectorMode() {
  const space = process.env.CONTENTFUL_SPACE_ID ?? '';
  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';

  return {
    name: 'contentful-inspector-mode',
    hooks: {
      /** @param {{ injectScript: (stage: 'page', content: string) => void }} api */
      'astro:config:setup': ({ injectScript }) => {
        injectScript(
          'page',
          [
            "import { ContentfulLivePreview } from '@contentful/live-preview';",
            // Root-relative because this string is resolved by Vite, not by the
            // tsconfig alias the rest of the app uses.
            "import { CMS_LOCALE } from '/src/lib/content-model';",
            'ContentfulLivePreview.init({',
            '  locale: CMS_LOCALE,',
            `  space: ${JSON.stringify(space)},`,
            `  environment: ${JSON.stringify(environment)},`,
            '  enableInspectorMode: true,',
            // Live updates patch entry data in the browser. A statically built
            // page has none to patch, so they would do nothing but add weight.
            '  enableLiveUpdates: false,',
            '});',
          ].join('\n'),
        );
      },
    },
  };
}

const isPreview = process.env.CONTENTFUL_USE_PREVIEW === 'true';

export default defineConfig({
  site,
  output: 'static',
  // Emits /about/index.html, which the CloudFront rewrite function expects.
  build: { format: 'directory' },
  integrations: [sitemap(), ...(isPreview ? [inspectorMode()] : [])],
  vite: {
    plugins: [tailwindcss()],
    build: {
      /*
       * Emit every script as its own file instead of folding small ones inline.
       * Both deployed environments send `script-src 'self'` with no
       * `'unsafe-inline'` (infra/lib/site-stack.ts), so an inlined script is
       * silently refused by the browser: present, correct, and never run.
       */
      assetsInlineLimit: 0,
    },
  },
  prefetch: { defaultStrategy: 'viewport' },
});
