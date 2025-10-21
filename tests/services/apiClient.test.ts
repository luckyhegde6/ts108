/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { apiClient } from '../../src/services/apiClient';

describe('apiClient (mock)', () => {
  it('fetches users via get', async () => {
    const res = await apiClient.get('/users');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect((res.data as any[]).length).toBeGreaterThan(0);
  });

  it('fetches metrics via get', async () => {
    const res = await apiClient.get('/metrics');
    expect(res.success).toBe(true);
    expect(Array.isArray(res.data)).toBe(true);
    expect((res.data as any[]).length).toBeGreaterThan(0);
  });

  it('creates a user via post', async () => {
    const newUser = { name: 'Test', email: 't@example.com', role: 'user' };
    const res = await apiClient.post('/users', newUser);
    expect(res.success).toBe(true);
    expect(res.data).toHaveProperty('id');
    expect((res.data as any).name).toBe('Test');
  });

  it('updates a user via put and then deletes it via delete', async () => {
    // create
    const created = await apiClient.post('/users', { name: 'ToUpdate', email: 'u@example.com', role: 'user' });
    expect(created.success).toBe(true);
    const id = (created.data as any).id;

    // update
    const updated = await apiClient.put(`/users/${id}`, { name: 'Updated' });
    expect(updated.success).toBe(true);
    expect((updated.data as any).name).toBe('Updated');

    // delete
    const deleted = await apiClient.delete(`/users/${id}`);
    expect(deleted.success).toBe(true);
    expect((deleted.data as any).id).toBe(id);
  });
});
