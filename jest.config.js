/** @type {import('jest').Config} */
const config = {
  preset: 'jest-expo',
  // Include jest-expo's own setup file (it sets up expo module mocks).
  // We must list it explicitly because specifying `setupFiles` overrides the preset.
  setupFiles: [
    'jest-expo/src/preset/setup.js',
    '<rootDir>/jest.globals.js',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@sentry/.*)',
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    // Mock expo winter runtime to prevent "import outside scope" errors in Jest.
    // The lazy property getters in installGlobal.ts trigger this module during
    // module initialization, before Jest considers the code to be "in scope".
    'expo/src/winter/runtime\\.native': '<rootDir>/__mocks__/expo-winter-runtime.js',
    // Mock @ungap/structured-clone which is lazily required by expo's winter runtime.
    // Node 18+ has structuredClone built-in; the mock delegates to the native impl.
    '^@ungap/structured-clone$': '<rootDir>/__mocks__/structured-clone.js',
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = config;
