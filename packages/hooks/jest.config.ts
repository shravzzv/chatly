module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@chatly/hooks/(.*)$': '<rootDir>/src/$1',
    '^@chatly/lib/(.*)$': '<rootDir>/../lib/src/$1',
    '^@chatly/types/(.*)$': '<rootDir>/../types/src/$1',
  },
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  roots: ['<rootDir>/__tests__'],
  verbose: false,
}
