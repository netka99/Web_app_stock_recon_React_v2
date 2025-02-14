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
    'plugin:@typescript-eslint/recommended',  // Add TypeScript plugin
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.js', '.eslintrc.cjs', '*.tsx', '*.ts'],  // Include .tsx and .ts files
      parser: '@typescript-eslint/parser', // Use TypeScript parser for TS/TSX files
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,  // Enable JSX parsing
        },
      },
      plugins: ['@typescript-eslint'], // Add TypeScript plugin
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,  // Enable JSX parsing for React
    },
  },
  plugins: ['react', 'prettier', '@typescript-eslint'], // Add TypeScript plugin
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        printWidth: 90,
      },
    ],
    // Add any custom rules for TypeScript here if needed
  },
};
