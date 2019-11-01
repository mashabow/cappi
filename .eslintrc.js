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
};
