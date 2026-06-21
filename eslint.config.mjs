import cwv from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';

// Node globals for the plain-JS helper scripts (.mjs) where typescript-eslint's
// automatic `no-undef` suppression does not apply.
const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  __dirname: 'readonly',
  module: 'readonly',
  require: 'readonly',
};

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
      'playwright/.cache/**',
    ],
  },
  ...cwv,
  ...ts,
  {
    // Test specs and tooling scripts legitimately log to the console and run in
    // a Node/CI context rather than the browser app runtime.
    files: ['scripts/**/*.mjs', 'tests/**/*.ts', 'playwright.config.ts'],
    languageOptions: {
      globals: nodeGlobals,
    },
    rules: {
      'no-console': 'off',
    },
  },
];

export default eslintConfig;
