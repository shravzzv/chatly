import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@chatly/hooks/(.*)$': '<rootDir>/../../packages/hooks/src/$1',
    '^@chatly/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
    '^@chatly/lib/(.*)$': '<rootDir>/../../packages/lib/src/$1',
  },
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/e2e'],
  verbose: false,
  testEnvironment: 'jsdom',
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)
