import cwv from 'eslint-config-next/core-web-vitals';
import ts from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...cwv,
  ...ts,
];

export default eslintConfig;
