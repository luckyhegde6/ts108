import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Helper to force garbage collection if available
const forceGC = () => {
  if (typeof (globalThis as { gc?: () => void }).gc === 'function') {
    (globalThis as { gc: () => void }).gc();
  }
};

// Mock IntersectionObserver before all tests
beforeAll(() => {
  class MockIntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

// Clean up after each test
afterEach(() => {
  // Clean up any mounted React components
  cleanup();
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Clear timers created via vi.useFakeTimers()
  try {
    vi.clearAllTimers();
  } catch (e) {
    // ignore if vi timers aren't in use
  }
  
  // Force garbage collection if available
  forceGC();
});