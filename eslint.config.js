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
  },
]
