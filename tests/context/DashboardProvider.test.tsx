/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import DashboardProvider, { useDashboard } from '../../src/context/DashboardProvider';

// Mock the API client used by the provider
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(async (url: string) => {
      if (url === '/users') return { success: true, data: [{ id: '1', name: 'X' }] };
      if (url === '/metrics') return { success: true, data: [{ id: 'm1', name: 'Metric', value: 1 }] };
      return { success: false, data: null };
    }),
  post: vi.fn(async (_url: string, data: any) => ({ success: true, data: { id: '2', ...data } })),
  put: vi.fn(async (_url: string, data: any) => ({ success: true, data: { id: _url.split('/')[2], ...data } })),
  delete: vi.fn(async (_url: string) => ({ success: true, data: { id: _url.split('/')[2] } })),
  },
}));

// Silence logger
vi.mock('../../src/utils/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('DashboardProvider', () => {
  it('loads users and metrics', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await act(async () => {
      await result.current.actions.loadUsers();
    });

    expect(result.current.state.users.length).toBeGreaterThan(0);

    await act(async () => {
      await result.current.actions.loadMetrics();
    });

    expect(result.current.state.metrics.length).toBeGreaterThan(0);
  });

  it('selects and adds a user', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => result.current.actions.selectUser({ id: '1', name: 'X' } as any));
    expect(result.current.state.selectedUser).not.toBeNull();

    await act(async () => {
      await result.current.actions.addUser({ name: 'New', email: 'n@example.com', role: 'user' } as any);
    });

    expect(result.current.state.users.some((u: any) => u.name === 'New')).toBe(true);
  });

  it('updates and deletes a user', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // add a user first
    await act(async () => {
      await result.current.actions.addUser({ name: 'ToRemove', email: 'r@example.com', role: 'user' } as any);
    });

    const user = result.current.state.users.find((u: any) => u.name === 'ToRemove');
    expect(user).toBeDefined();

    if (!user) {
      throw new Error('User expected to be defined');
    }

    await act(async () => {
      await result.current.actions.updateUser(user.id, { name: 'Updated' });
    });

    expect(result.current.state.users.some((u: any) => u.name === 'Updated')).toBe(true);

    await act(async () => {
      await result.current.actions.deleteUser(user.id);
    });

    expect(result.current.state.users.some((u: any) => u.id === user.id)).toBe(false);
  });
});
