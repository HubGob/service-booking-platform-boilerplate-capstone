module.exports = {
  testEnvironment: 'node',
  testTimeout: 15000,
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
  passWithNoTests: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
};
