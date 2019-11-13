module.exports = {
  extends: [
    'react-app',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': ['warn', {
      singleQuote: true,
      trailingComma: 'all',
    }],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': ['warn', {
          allowExpressions: true,
        }],
      },
    },
  ],
};
