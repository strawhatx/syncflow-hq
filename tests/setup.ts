import { vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock Date.now() for consistent timestamps in tests
const mockDate = new Date('2024-01-01T00:00:00.000Z');
vi.spyOn(Date, 'now').mockImplementation(() => mockDate.getTime());
vi.spyOn(Date.prototype, 'toISOString').mockImplementation(() => mockDate.toISOString()); 