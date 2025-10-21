/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClientImpl } from '../../src/services/apiClient';

const originalFetch = (globalThis as any).fetch;

describe('ApiClientImpl error paths', () => {
  beforeEach(() => {
  (globalThis as any).fetch = vi.fn();
  });

  afterEach(() => {
  (globalThis as any).fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('returns error when fetch returns non-ok', async () => {
  ((globalThis as any).fetch as any).mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });

    const client = new ApiClientImpl('/api');
    const res = await client.get('/fail');

    expect(res.success).toBe(false);
    expect(res.message).toMatch(/HTTP error/);
  });

  it('returns error when fetch throws', async () => {
  ((globalThis as any).fetch as any).mockRejectedValue(new Error('network error'));

    const client = new ApiClientImpl('/api');
    const res = await client.get('/throw');

    expect(res.success).toBe(false);
    expect(res.message).toBe('network error');
  });

  it('post/put/delete handle non-ok', async () => {
  ((globalThis as any).fetch as any).mockResolvedValue({ ok: false, status: 400, json: async () => ({}) });
    const client = new ApiClientImpl('/api');

    const post = await client.post('/x', { foo: 'bar' });
    expect(post.success).toBe(false);

    const put = await client.put('/x', { foo: 'bar' });
    expect(put.success).toBe(false);

    const del = await client.delete('/x');
    expect(del.success).toBe(false);
  });
});
