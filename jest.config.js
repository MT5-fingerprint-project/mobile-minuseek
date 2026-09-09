/**
 * Tests unitaires — preset `jest-expo` (SDK 54), qui apporte la transformation Babel
 * du projet et les mocks des modules Expo.
 *
 * `moduleNameMapper` reprend l'alias `@/*` du tsconfig, que Jest ne lit pas.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
