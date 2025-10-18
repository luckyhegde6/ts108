import { useState, useEffect, useCallback } from 'react';
import type { UseApiReturn } from '../types';
import { apiClient } from '../services/apiClient';
import { logger } from '../utils/logger';

export function useApi<T>(url: string, immediate: boolean = true): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('Fetching data...', { url });
      const response = await apiClient.get<T>(url);
      
      if (response.success && response.data !== null) {
        setData(response.data);
        logger.info('Data fetched successfully', { url });
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      logger.error('Failed to fetch data', err instanceof Error ? err : undefined, { url });
    } finally {
      setLoading(false);
    }
  }, [url]);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

export default useApi;
