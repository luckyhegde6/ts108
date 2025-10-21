/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { render, screen as rtlScreen, fireEvent } from '@testing-library/react';
import UserList from '../../src/components/users/UserList';

const users = [
  { id: '1', name: 'A', email: 'a@x.com', role: 'user', avatar: '', createdAt: new Date(), lastLogin: new Date(), isActive: true },
  { id: '2', name: 'B', email: 'b@x.com', role: 'admin', avatar: '', createdAt: new Date(), lastLogin: new Date(), isActive: false },
];

describe('UserList', () => {
  it('renders empty state', () => {
  render(<UserList users={[]} onUserSelect={() => {}} onUserEdit={() => {}} onUserDelete={() => {}} />);
  expect(rtlScreen.getByText('No users found')).toBeInTheDocument();
  });

  it('renders rows when users provided', () => {
    const onSelect = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

  render(<UserList users={users as any} onUserSelect={onSelect} onUserEdit={onEdit} onUserDelete={onDelete} />);
  expect(rtlScreen.getByText('A')).toBeInTheDocument();
  expect(rtlScreen.getByText('B')).toBeInTheDocument();

    // simulate selecting user row by clicking the name (UserRow handles propagation)
  fireEvent.click(rtlScreen.getByText('A'));
  expect(onSelect).toHaveBeenCalled();

    // simulate edit/delete via buttons in rendered rows
    const editButtons = rtlScreen.getAllByText('Edit');
    if (editButtons[0]) {
      fireEvent.click(editButtons[0]);
    }
    expect(onEdit).toHaveBeenCalled();

    // mock confirm to allow delete
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteButtons = rtlScreen.getAllByText('Delete');
    if (deleteButtons[0]) {
      fireEvent.click(deleteButtons[0]);
    }
    expect(onDelete).toHaveBeenCalled();
  });
});
