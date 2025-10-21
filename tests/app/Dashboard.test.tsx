/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen as rtlScreen, fireEvent } from '@testing-library/react';
import Dashboard from '../../src/app/Dashboard';

// Mock the dashboard context hook to provide simple state and actions
vi.mock('../../src/context/DashboardProvider', () => ({
  useDashboard: () => ({
    state: {
      users: [{ id: '1', name: 'A', email: 'a@x.com', role: 'user', avatar: '', createdAt: new Date(), lastLogin: new Date(), isActive: true }],
      metrics: [{ id: 'm1', name: 'Metric', value: 100, unit: 'u', trend: 'up', changePercent: 5, timestamp: new Date() }],
      isLoading: false,
      error: null,
      selectedUser: null,
    },
    actions: {
      loadUsers: vi.fn(),
      loadMetrics: vi.fn(),
      selectUser: vi.fn(),
      addUser: vi.fn(async () => {}),
      updateUser: vi.fn(async () => {}),
      deleteUser: vi.fn(async () => {}),
    },
  }),
}));

describe('Dashboard', () => {
  it('renders dashboard header and add user button', () => {
  render(<Dashboard />);
  expect(rtlScreen.getByText('Dashboard')).toBeInTheDocument();
  expect(rtlScreen.getAllByText('Add User').length).toBeGreaterThanOrEqual(1);
  });

  it('shows add user form when Add User clicked', () => {
  render(<Dashboard />);
  const addButtons = rtlScreen.getAllByText('Add User');
  if (addButtons[0]) fireEvent.click(addButtons[0]);
  expect(rtlScreen.getByText('Add New User')).toBeInTheDocument();
  });
});
