import globals from 'globals';
import pluginJs from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/'],
  },
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      quotes: ['warn', 'single'],
      semi: ['warn', 'always'],
    },
  },
];
