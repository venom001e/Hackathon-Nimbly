import '@testing-library/jest-dom'

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock Prisma
jest.mock('./lib/prisma', () => ({
  prisma: {
    enrolmentData: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    trendAnalysis: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    anomaly: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
    uploadJob: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    forecast: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock Redis
jest.mock('./lib/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}))