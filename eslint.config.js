const neostandard = require('neostandard')

module.exports = [
  {
    ignores: ['eslint.config.js'],
  },
  ...neostandard({
    env: ['node'],
  }),
  {
    files: ['**/*.js'],
    languageOptions: {
      // Keep project syntax limited to ES2015 compatibility.
      ecmaVersion: 2015,
      sourceType: 'commonjs',
    },
    rules: {
      'no-var': 'off',
      'prefer-const': 'off',
      '@stylistic/no-multiple-empty-lines': 'off',
      'object-shorthand': 'off',
      'no-useless-escape': 'off',
      'n/no-deprecated-api': 'off',
      '@stylistic/key-spacing': 'off',
      'camelcase': 'off',
    },
  },
]
