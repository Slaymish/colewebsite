import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import { configs as tsConfigs } from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'infra/cdk.out/'] },
  js.configs.recommended,
  ...tsConfigs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // CloudFront Functions run on their own runtime and expose `handler` as a
    // global entrypoint, so it is never referenced from inside the file.
    files: ['infra/functions/*.js'],
    rules: { '@typescript-eslint/no-unused-vars': 'off' },
  },
);
