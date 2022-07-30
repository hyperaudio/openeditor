module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },

  extends: [
    'react-app',
    'react-app/jest',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'prettier',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },

  rules: {
    'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error'],
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.tsx'],
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    // 'max-len': [
    //   'warn',
    //   {
    //     code: 80,
    //   },
    // ],
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        // alphabetize: {
        //   order: 'asc',
        //   caseInsensitive: true,
        // },
      },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'function',
        format: ['PascalCase', 'camelCase'],
      },
    ],
    'react/function-component-definition': ['warn', { namedComponents: 'arrow-function' }],
  },

  plugins: ['react', '@typescript-eslint', 'react-hooks', 'eslint-plugin-import', 'prettier'],
};
