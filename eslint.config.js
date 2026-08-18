// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier/flat')
const simpleImportSort = require('eslint-plugin-simple-import-sort')

module.exports = defineConfig([
  expoConfig,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  // `eslint-config-prettier` en dernier : il désactive les règles de style
  // qui entreraient en conflit avec Prettier.
  prettierConfig,
  {
    // `.expo/` contient des types générés (router.d.ts) : gitignorés, pas à linter.
    ignores: ['dist/*', '.expo/*'],
  },
])
