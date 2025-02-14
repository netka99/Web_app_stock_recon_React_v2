// module.exports = {
//   env: {
//     browser: true,
//     es2021: true,
//   },
//   extends: [
//     'eslint:recommended',
//     'plugin:react/recommended',
//     'eslint:recommended',
//     'plugin:prettier/recommended',
//     'plugin:@typescript-eslint/recommended',
//   ],
//   overrides: [
//     {
//       env: {
//         node: true,
//       },
//       files: ['.eslintrc.js', '.eslintrc.cjs', '*.tsx', '*.ts'],
//       parser: '@typescript-eslint/parser',
//       parserOptions: {
//         sourceType: 'script',
//       },
//     },
//   ],
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//     ecmaFeatures: {
//       jsx: true,  // Enable JSX parsing
//     },
//   },
//   plugins: ['react', 'prettier'],
//   rules: {
//     'prettier/prettier': [
//       'error',
//       {
//         endOfLine: 'auto',
//         printWidth: 90,
//       },
//     ],
//   },
// }
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    react: {
      version: 'detect', // Automatically detects the React version
    },
  },
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.js', '.eslintrc.cjs', '*.tsx', '*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint', 'react'],
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'prettier', '@typescript-eslint'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        printWidth: 90,
      },
    ],
  },
};

