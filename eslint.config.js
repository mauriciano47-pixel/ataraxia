// Configuration for ESLint 8 / ESLint 9 compatible with Codacy & Expo TypeScript
export default [
  {
    ignores: [
      'dist/**',
      'public/**',
      'assets/**',
      'scripts/**',
      'tests/**',
      'e2e/**',
      '.firebase/**',
      'node_modules/**',
      'scratch/**',
      'sbom.cdx.json',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'security/detect-object-injection': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
];
