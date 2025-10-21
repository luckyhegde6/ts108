import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserDetails from '../../src/app/UserDetails';
import type { User } from '../../src/types';

const mockUser: User = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
  avatar: '',
  createdAt: new Date(),
  lastLogin: new Date(),
  isActive: true,
};

const mockDashboardState = {
  users: [mockUser],
  metrics: [],
  isLoading: false,
  error: null,
  selectedUser: null,
};

const mockActions = {
  loadUsers: vi.fn(),
  loadMetrics: vi.fn(),
  selectUser: vi.fn(),
  addUser: vi.fn(async () => {}),
  updateUser: vi.fn(async () => {}),
  deleteUser: vi.fn(async () => {}),
};

const mockUseDashboard = vi.fn(() => ({
  state: {
    ...mockDashboardState
  },
  actions: {
    ...mockActions
  },
}));

vi.mock('../../src/context/DashboardProvider', () => ({
  useDashboard: () => mockUseDashboard()
}));

describe('UserDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders user details when user exists', async () => {
    render(
      <MemoryRouter initialEntries={["/users/u1"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

    it('allows toggling edit mode and saving', async () => {
    const user = userEvent.setup();
    mockActions.updateUser.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      return true as unknown as void; // Return a non-undefined value of type void
    });

    render(
      <MemoryRouter initialEntries={["/users/u1"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
    });

    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    // Update form fields
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Alice Updated');

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    // Wait for update to complete and verify
    await waitFor(() => {
      expect(mockActions.updateUser).toHaveBeenCalledWith('u1', {
        name: 'Alice Updated',
        email: 'alice@example.com',
        role: 'user',
        isActive: true,
      });
      expect(screen.queryByRole('form')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles errors during user update', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to update user';
    mockActions.updateUser.mockRejectedValueOnce(new Error(errorMessage));

    render(
      <MemoryRouter initialEntries={["/users/u1"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('User Details')).toBeInTheDocument();
    });

    // Enter edit mode
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
    
    // Update form fields
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Alice Updated');

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error');

    // Submit form
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    // Verify error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update user:', expect.any(Error));
      expect(screen.getByRole('form')).toBeInTheDocument(); // Form should still be shown
    });

    // Clean up spy
    consoleSpy.mockRestore();
  });

  it('loads users if user is not found initially', async () => {
    mockUseDashboard.mockImplementationOnce(() => ({
      state: {
        ...mockDashboardState,
        users: []
      },
      actions: mockActions
    }));

    render(
      <MemoryRouter initialEntries={["/users/u1"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockActions.loadUsers).toHaveBeenCalled();
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  it('handles update error gracefully', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Update failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockActions.updateUser.mockRejectedValueOnce(mockError);

    render(
      <MemoryRouter initialEntries={["/users/u1"]}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /edit/i }));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update user:', mockError);
    });

    consoleSpy.mockRestore();
  });
});
