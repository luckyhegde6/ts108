# Typed API Client and Data Fetching

This guide covers advanced TypeScript patterns for API clients, data fetching, error handling, and type-safe data management used in the TypeSafe Dashboard project.

## Table of Contents

1. [Generic API Client](#generic-api-client)
2. [Type-Safe Data Fetching](#type-safe-data-fetching)
3. [Error Handling Patterns](#error-handling-patterns)
4. [Request/Response Typing](#requestresponse-typing)
5. [Caching and State Management](#caching-and-state-management)
6. [Testing API Clients](#testing-api-clients)

## Generic API Client

### Base API Client Interface

```typescript
// Generic API response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode?: number;
}

// Generic API error
interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Generic API client interface
interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}
```

### Real API Client Implementation

```typescript
class RealApiClient implements ApiClient {
  private baseUrl: string;
  private defaultConfig: RequestConfig;

  constructor(baseUrl: string, defaultConfig: RequestConfig = {}) {
    this.baseUrl = baseUrl;
    this.defaultConfig = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      ...defaultConfig,
    };
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: unknown,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const fullUrl = `${this.baseUrl}${url}`;

    for (let attempt = 0; attempt <= finalConfig.retries!; attempt++) {
      try {
        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...finalConfig.headers,
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: AbortSignal.timeout(finalConfig.timeout!),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new ApiError(
            responseData.message || 'Request failed',
            response.status,
            responseData.code,
            responseData.details
          );
        }

        return {
          data: responseData,
          message: 'Success',
          success: true,
          statusCode: response.status,
        };
      } catch (error) {
        if (attempt === finalConfig.retries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => 
          setTimeout(resolve, finalConfig.retryDelay! * Math.pow(2, attempt))
        );
      }
    }

    throw new Error('Max retries exceeded');
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, undefined, config);
  }
}

// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Mock API Client for Development

```typescript
class MockApiClient implements ApiClient {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Mock data
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=1',
      createdAt: new Date('2023-01-15'),
      lastLogin: new Date('2024-01-10'),
      isActive: true,
    },
    // ... more mock data
  ];

  private mockMetrics: Metric[] = [
    {
      id: '1',
      name: 'Active Users',
      value: 1250,
      unit: 'users',
      trend: 'up',
      changePercent: 12.5,
      timestamp: new Date(),
    },
    // ... more mock data
  ];

  async get<T>(url: string): Promise<ApiResponse<T>> {
    await this.delay(500); // Simulate network delay
    
    if (url === '/users') {
      return {
        data: this.mockUsers as T,
        message: 'Users fetched successfully',
        success: true,
        statusCode: 200,
      };
    }
    
    if (url === '/metrics') {
      return {
        data: this.mockMetrics as T,
        message: 'Metrics fetched successfully',
        success: true,
        statusCode: 200,
      };
    }
    
    if (url.startsWith('/users/')) {
      const userId = url.split('/')[2];
      const user = this.mockUsers.find(u => u.id === userId);
      
      if (user) {
        return {
          data: user as T,
          message: 'User fetched successfully',
          success: true,
          statusCode: 200,
        };
      }
    }
    
    return {
      data: null as T,
      message: 'Not found',
      success: false,
      statusCode: 404,
    };
  }

  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url === '/users') {
      const userData = data as UserFormData;
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
        createdAt: new Date(),
      };
      
      this.mockUsers.push(newUser);
      
      return {
        data: newUser as T,
        message: 'User created successfully',
        success: true,
        statusCode: 201,
      };
    }
    
    return {
      data: null as T,
      message: 'Not implemented',
      success: false,
      statusCode: 501,
    };
  }

  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url.startsWith('/users/')) {
      const userId = url.split('/')[2];
      const userData = data as Partial<UserFormData>;
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        const updatedUser = { ...this.mockUsers[userIndex], ...userData };
        this.mockUsers[userIndex] = updatedUser;
        
        return {
          data: updatedUser as T,
          message: 'User updated successfully',
          success: true,
          statusCode: 200,
        };
      }
    }
    
    return {
      data: null as T,
      message: 'User not found',
      success: false,
      statusCode: 404,
    };
  }

  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.put<T>(url, data);
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url.startsWith('/users/')) {
      const userId = url.split('/')[2];
      const userIndex = this.mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        this.mockUsers.splice(userIndex, 1);
        
        return {
          data: { id: userId } as T,
          message: 'User deleted successfully',
          success: true,
          statusCode: 200,
        };
      }
    }
    
    return {
      data: null as T,
      message: 'User not found',
      success: false,
      statusCode: 404,
    };
  }
}

// Factory function to create appropriate client
export function createApiClient(): ApiClient {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    return new MockApiClient();
  }
  
  return new RealApiClient(
    import.meta.env.VITE_API_BASE_URL || '/api',
    {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
    }
  );
}

export const apiClient = createApiClient();
```

## Type-Safe Data Fetching

### Generic Data Fetching Hook

```typescript
interface UseApiOptions {
  immediate?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = true,
    refetchOnMount = true,
    refetchInterval,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<T>(url);
      
      if (response.success && response.data !== null) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
}
```

### Specialized Data Fetching Hooks

```typescript
// Users-specific hook
export function useUsers() {
  return useApi<User[]>('/users', {
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      console.log(`Loaded ${(data as User[]).length} users`);
    },
  });
}

// Metrics-specific hook
export function useMetrics() {
  return useApi<Metric[]>('/metrics', {
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Single user hook
export function useUser(userId: string) {
  return useApi<User>(`/users/${userId}`, {
    immediate: !!userId, // Only fetch if userId exists
  });
}

// Mutation hooks for data modification
export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (userData: UserFormData): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.post<User>('/users', userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    loading,
    error,
  };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(async (
    userId: string, 
    userData: Partial<UserFormData>
  ): Promise<User | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.put<User>(`/users/${userId}`, userData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateUser,
    loading,
    error,
  };
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.delete<{ id: string }>(`/users/${userId}`);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteUser,
    loading,
    error,
  };
}
```

## Error Handling Patterns

### Centralized Error Handling

```typescript
interface ErrorHandler {
  handleError: (error: Error, context?: string) => void;
  clearError: () => void;
  getError: () => string | null;
}

class ApiErrorHandler implements ErrorHandler {
  private error: string | null = null;

  handleError(error: Error, context?: string): void {
    let errorMessage = error.message;
    
    if (error instanceof ApiError) {
      errorMessage = this.formatApiError(error);
    }
    
    if (context) {
      errorMessage = `${context}: ${errorMessage}`;
    }
    
    this.error = errorMessage;
    console.error('API Error:', errorMessage, error);
    
    // Could also send to error reporting service
    // this.reportError(error, context);
  }

  private formatApiError(error: ApiError): string {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request data';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error occurred';
      default:
        return error.message;
    }
  }

  clearError(): void {
    this.error = null;
  }

  getError(): string | null {
    return this.error;
  }
}

export const errorHandler = new ApiErrorHandler();
```

### Error Boundary Integration

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ApiErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    errorHandler.handleError(error, 'React Error Boundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Request/Response Typing

### DTOs and Validation

```typescript
import { z } from 'zod';

// User DTOs
const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'user', 'moderator']),
  isActive: z.boolean().default(true),
});

const UpdateUserSchema = CreateUserSchema.partial();

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'moderator']),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  lastLogin: z.date().optional(),
  isActive: z.boolean(),
});

// Metric DTOs
const MetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  trend: z.enum(['up', 'down', 'stable']),
  changePercent: z.number(),
  timestamp: z.date(),
});

// Type inference from schemas
type CreateUserDTO = z.infer<typeof CreateUserSchema>;
type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
type UserResponseDTO = z.infer<typeof UserResponseSchema>;
type MetricDTO = z.infer<typeof MetricSchema>;

// Validation functions
export function validateCreateUser(data: unknown): CreateUserDTO {
  return CreateUserSchema.parse(data);
}

export function validateUpdateUser(data: unknown): UpdateUserDTO {
  return UpdateUserSchema.parse(data);
}

export function validateUserResponse(data: unknown): UserResponseDTO {
  return UserResponseSchema.parse(data);
}

export function validateMetric(data: unknown): MetricDTO {
  return MetricSchema.parse(data);
}
```

### Type-Safe API Endpoints

```typescript
// API endpoint definitions with proper typing
interface ApiEndpoints {
  users: {
    list: () => Promise<ApiResponse<UserResponseDTO[]>>;
    get: (id: string) => Promise<ApiResponse<UserResponseDTO>>;
    create: (data: CreateUserDTO) => Promise<ApiResponse<UserResponseDTO>>;
    update: (id: string, data: UpdateUserDTO) => Promise<ApiResponse<UserResponseDTO>>;
    delete: (id: string) => Promise<ApiResponse<{ id: string }>>;
  };
  metrics: {
    list: () => Promise<ApiResponse<MetricDTO[]>>;
    get: (id: string) => Promise<ApiResponse<MetricDTO>>;
  };
}

class TypedApiClient implements ApiEndpoints {
  users = {
    list: () => apiClient.get<UserResponseDTO[]>('/users'),
    get: (id: string) => apiClient.get<UserResponseDTO>(`/users/${id}`),
    create: (data: CreateUserDTO) => apiClient.post<UserResponseDTO>('/users', data),
    update: (id: string, data: UpdateUserDTO) => 
      apiClient.put<UserResponseDTO>(`/users/${id}`, data),
    delete: (id: string) => apiClient.delete<{ id: string }>(`/users/${id}`),
  };

  metrics = {
    list: () => apiClient.get<MetricDTO[]>('/metrics'),
    get: (id: string) => apiClient.get<MetricDTO>(`/metrics/${id}`),
  };
}

export const typedApiClient = new TypedApiClient();
```

## Caching and State Management

### Simple Cache Implementation

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

export const apiCache = new ApiCache();

// Cached API client
class CachedApiClient implements ApiClient {
  constructor(private baseClient: ApiClient) {}

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const cacheKey = `GET:${url}`;
    const cached = apiCache.get<ApiResponse<T>>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const response = await this.baseClient.get<T>(url, config);
    
    if (response.success) {
      apiCache.set(cacheKey, response);
    }
    
    return response;
  }

  // ... implement other methods similarly
}
```

## Testing API Clients

### Mock API Client Testing

```typescript
import { MockApiClient } from '../services/apiClient';

describe('MockApiClient', () => {
  let mockClient: MockApiClient;

  beforeEach(() => {
    mockClient = new MockApiClient();
  });

  describe('GET /users', () => {
    it('should return list of users', async () => {
      const response = await mockClient.get<User[]>('/users');
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const userData: UserFormData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
      };

      const response = await mockClient.post<User>('/users', userData);
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe(userData.name);
      expect(response.data?.email).toBe(userData.email);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an existing user', async () => {
      // First create a user
      const createResponse = await mockClient.post<User>('/users', {
        name: 'Original Name',
        email: 'original@example.com',
        role: 'user',
        isActive: true,
      });

      const userId = createResponse.data!.id;
      const updateData = { name: 'Updated Name' };

      const response = await mockClient.put<User>(`/users/${userId}`, updateData);
      
      expect(response.success).toBe(true);
      expect(response.data?.name).toBe('Updated Name');
      expect(response.data?.email).toBe('original@example.com');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      // First create a user
      const createResponse = await mockClient.post<User>('/users', {
        name: 'To Delete',
        email: 'delete@example.com',
        role: 'user',
        isActive: true,
      });

      const userId = createResponse.data!.id;

      const response = await mockClient.delete<{ id: string }>(`/users/${userId}`);
      
      expect(response.success).toBe(true);
      expect(response.data?.id).toBe(userId);
    });
  });
});
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useUsers, useCreateUser } from '../hooks/useApi';

// Mock the API client
jest.mock('../services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('API Hooks Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          createdAt: new Date(),
          isActive: true,
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUsers,
        message: 'Success',
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockUsers);
      expect(result.current.error).toBeNull();
    });

    it('should handle API errors', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
        message: 'API Error',
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('API Error');
    });
  });

  describe('useCreateUser', () => {
    it('should create user successfully', async () => {
      const userData: UserFormData = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        isActive: true,
      };

      const createdUser: User = {
        id: '2',
        ...userData,
        createdAt: new Date(),
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: createdUser,
        message: 'User created',
      });

      const { result } = renderHook(() => useCreateUser());

      const response = await result.current.createUser(userData);

      expect(response).toEqual(createdUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
```

This guide demonstrates comprehensive TypeScript patterns for API clients, data fetching, error handling, and testing, providing a robust foundation for type-safe data management in React applications.
