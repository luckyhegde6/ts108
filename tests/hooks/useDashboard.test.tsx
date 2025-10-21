import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider } from '../../src/context/DashboardProvider';
import { useDashboard } from '../../src/context/DashboardProvider';

// Mock the API client
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('useDashboard Hook', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    expect(result.current.state.users).toEqual([]);
    expect(result.current.state.metrics).toEqual([]);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe(null);
    expect(result.current.state.selectedUser).toBe(null);
  });

  it('provides actions', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    expect(typeof result.current.actions.loadUsers).toBe('function');
    expect(typeof result.current.actions.loadMetrics).toBe('function');
    expect(typeof result.current.actions.selectUser).toBe('function');
    expect(typeof result.current.actions.addUser).toBe('function');
    expect(typeof result.current.actions.updateUser).toBe('function');
    expect(typeof result.current.actions.deleteUser).toBe('function');
  });

  it('selects user correctly', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    const testUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user' as const,
      createdAt: new Date(),
      isActive: true,
    };

    act(() => {
      result.current.actions.selectUser(testUser);
    });

    expect(result.current.state.selectedUser).toEqual(testUser);
  });
});
