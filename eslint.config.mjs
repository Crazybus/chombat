import js from '@eslint/js';
import globals from 'globals';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'main.js', '.wrangler/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        units: 'readonly',
        techs: 'readonly',
        buildings: 'readonly',
        bonuses: 'readonly',
        presets: 'readonly',
        scenarios: 'readonly',
        featuredScenarios: 'readonly',
        TECH_MAP: 'readonly',
        civs: 'readonly',
        Chart: 'readonly',
        Sortable: 'readonly',
      },
    },
    rules: {
      'no-redeclare': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(units|techs|buildings|bonuses|presets|scenarios|featuredScenarios|TECH_MAP|civs)$',
        },
      ],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
];
