/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useApi from '../../src/hooks/useApi';

// Mock apiClient
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(async (url: string) => {
      if (url === '/ok') return { success: true, data: { value: 1 } };
      if (url === '/empty') return { success: false, data: null, message: 'Not found' };
      return { success: false, data: null, message: 'Error' };
    }),
  },
}));

// Silence logger
vi.mock('../../src/utils/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

describe('useApi', () => {
  it('fetches data successfully when immediate', async () => {
    const { result } = renderHook(() => useApi('/ok'));

    // Wait for effect to run
    await act(async () => {
      // small tick
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ value: 1 });
    expect(result.current.error).toBeNull();
  });

  it('handles error responses', async () => {
    const { result } = renderHook(() => useApi('/empty'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('supports manual refetch', async () => {
    const { result } = renderHook(() => useApi('/ok', false));

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual({ value: 1 });
  });
});
