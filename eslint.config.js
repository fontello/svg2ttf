const neostandard = require('neostandard')

module.exports = [
  ...neostandard({
    env: ['node'],
  }),
  {
    files: ['**/*.js'],
    languageOptions: {
      // Keep parser syntax limited to Node.js 14 compatibility.
      ecmaVersion: 2020,
      sourceType: 'commonjs',
    },
  },
]
