import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserRow } from '../../src/components/users/UserRow';
import type { User } from '../../src/types';

const sampleUser: User = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'admin',
  avatar: '',
  createdAt: new Date(),
  lastLogin: new Date(),
  isActive: true,
};

describe('UserRow', () => {
  const renderUserRow = (props: { 
    onSelect: (user: User) => void; 
    onEdit: (user: User) => void; 
    onDelete: (id: string) => void; 
  }) => {
    return render(
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <UserRow 
            user={sampleUser} 
            onSelect={props.onSelect} 
            onEdit={props.onEdit} 
            onDelete={props.onDelete} 
          />
        </tbody>
      </table>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders user details and calls onSelect when row clicked', async () => {
    const props = {
      onSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn()
    };

    const { getByText } = renderUserRow(props);
    const user = userEvent.setup();

    expect(getByText('Alice')).toBeInTheDocument();
    expect(getByText('alice@example.com')).toBeInTheDocument();
    expect(getByText('admin')).toBeInTheDocument();

    const tbody = document.querySelector('tbody');
    if (!tbody) throw new Error('Table body not found');
    const dataRow = tbody.querySelector('tr');
    if (!dataRow) throw new Error('Data row not found');
    await user.click(dataRow);
    expect(props.onSelect).toHaveBeenCalledWith(sampleUser);
  });

  it('calls onEdit when Edit button clicked and stops propagation', async () => {
    const props = {
      onSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn()
    };

    const { getByRole } = renderUserRow(props);
    const user = userEvent.setup();

    await user.click(getByRole('button', { name: /edit/i }));
    
    expect(props.onEdit).toHaveBeenCalledWith(sampleUser);
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it('calls onDelete when Delete clicked and confirmed', async () => {
    const props = {
      onSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn()
    };

    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const { getByRole } = renderUserRow(props);
    const user = userEvent.setup();

    await user.click(getByRole('button', { name: /delete/i }));
    
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete Alice?');
    expect(props.onDelete).toHaveBeenCalledWith('u1');
    expect(props.onSelect).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('does not call onDelete when Delete clicked and not confirmed', async () => {
    const props = {
      onSelect: vi.fn(),
      onEdit: vi.fn(),
      onDelete: vi.fn()
    };

    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
    const { getByRole } = renderUserRow(props);
    const user = userEvent.setup();

    await user.click(getByRole('button', { name: /delete/i }));
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(props.onDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
