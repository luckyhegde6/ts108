# Testing TypeScript React Applications

This guide covers comprehensive testing strategies for TypeScript React applications, including unit tests, integration tests, and type safety testing used in the TypeSafe Dashboard project.

## Table of Contents

1. [Testing Setup](#testing-setup)
2. [Component Testing](#component-testing)
3. [Hook Testing](#hook-testing)
4. [Context Testing](#context-testing)
5. [API Testing](#api-testing)
6. [Type Safety Testing](#type-safety-testing)
7. [Integration Testing](#integration-testing)
8. [Mocking Strategies](#mocking-strategies)

## Testing Setup

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
    },
  },
})
```

### Test Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
});

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
});
```

### Test Utilities

```typescript
// src/test/utils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardProvider } from '../context/DashboardProvider';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withRouter?: boolean;
  withContext?: boolean;
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withRouter = false, withContext = false, ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = children;

    if (withContext) {
      content = <DashboardProvider>{content}</DashboardProvider>;
    }

    if (withRouter) {
      content = <BrowserRouter>{content}</BrowserRouter>;
    }

    return <>{content}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
```

## Component Testing

### Basic Component Tests

```typescript
// tests/components/Card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../../src/components/ui/Card';

describe('Card Component', () => {
  it('renders with title', () => {
    render(<Card title="Test Card">Content</Card>);
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(
      <Card title="Test Card" subtitle="Test Subtitle">
        Content
      </Card>
    );
    
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(
      <Card title="Test Card" className="custom-class">
        Content
      </Card>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with actions', () => {
    const actions = <button>Action Button</button>;
    
    render(
      <Card title="Test Card" actions={actions}>
        Content
      </Card>
    );
    
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
```

### Component with Props Testing

```typescript
// tests/components/UserRow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserRow } from '../../src/components/users/UserRow';
import type { User } from '../../src/types';

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  createdAt: new Date('2023-01-15'),
  isActive: true,
};

describe('UserRow Component', () => {
  const mockOnSelect = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user information correctly', () => {
    render(
      <UserRow
        user={mockUser}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onSelect when row is clicked', () => {
    render(
      <UserRow
        user={mockUser}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('John Doe'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockUser);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <UserRow
        user={mockUser}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });

  it('calls onDelete when delete button is clicked', () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(
      <UserRow
        user={mockUser}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete John Doe?');
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when confirmation is cancelled', () => {
    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false);

    render(
      <UserRow
        user={mockUser}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});
```

### Form Component Testing

```typescript
// tests/components/UserForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserForm } from '../../src/components/UserForm';

describe('UserForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'user');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
      });
    });
  });

  it('handles form cancellation', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
```

## Hook Testing

### Custom Hook Testing

```typescript
// tests/hooks/useApi.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../../src/hooks/useApi';

// Mock the API client
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '../../src/services/apiClient';

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useApi<User[]>('/users'));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        isActive: true,
      },
    ];

    (apiClient.get as any).mockResolvedValue({
      success: true,
      data: mockUsers,
      message: 'Success',
    });

    const { result } = renderHook(() => useApi<User[]>('/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    (apiClient.get as any).mockResolvedValue({
      success: false,
      data: null,
      message: 'API Error',
    });

    const { result } = renderHook(() => useApi<User[]>('/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('API Error');
  });

  it('refetches data when refetch is called', async () => {
    const { result } = renderHook(() => useApi<User[]>('/users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    await result.current.refetch();

    expect(apiClient.get).toHaveBeenCalledTimes(2);
  });
});
```

### Context Hook Testing

```typescript
// tests/hooks/useDashboard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../../src/context/DashboardProvider';

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

    const testUser: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      isActive: true,
    };

    act(() => {
      result.current.actions.selectUser(testUser);
    });

    expect(result.current.state.selectedUser).toEqual(testUser);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useDashboard());
    }).toThrow('useDashboard must be used within a DashboardProvider');
  });
});
```

## Context Testing

### Context Provider Testing

```typescript
// tests/context/DashboardProvider.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../../src/context/DashboardProvider';

// Mock the API client
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('DashboardProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads users successfully', async () => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        isActive: true,
      },
    ];

    (apiClient.get as any).mockResolvedValue({
      success: true,
      data: mockUsers,
      message: 'Success',
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.actions.loadUsers();
    });

    await waitFor(() => {
      expect(result.current.state.users).toEqual(mockUsers);
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  it('handles loading errors', async () => {
    (apiClient.get as any).mockResolvedValue({
      success: false,
      data: null,
      message: 'API Error',
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    act(() => {
      result.current.actions.loadUsers();
    });

    await waitFor(() => {
      expect(result.current.state.error).toBe('API Error');
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  it('adds user successfully', async () => {
    const newUser: User = {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user',
      createdAt: new Date(),
      isActive: true,
    };

    (apiClient.post as any).mockResolvedValue({
      success: true,
      data: newUser,
      message: 'Success',
    });

    const { result } = renderHook(() => useDashboard(), { wrapper });

    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'user' as const,
      isActive: true,
    };

    await act(async () => {
      await result.current.actions.addUser(userData);
    });

    expect(result.current.state.users).toContain(newUser);
  });
});
```

## API Testing

### API Client Testing

```typescript
// tests/services/apiClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { MockApiClient } from '../../src/services/apiClient';
import type { User, UserFormData } from '../../src/types';

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

## Type Safety Testing

### Type Guard Testing

```typescript
// tests/utils/typeGuards.test.ts
import { describe, it, expect } from 'vitest';
import { isUser, isApiResponse } from '../../src/utils/typeGuards';

describe('Type Guards', () => {
  describe('isUser', () => {
    it('returns true for valid user object', () => {
      const validUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        isActive: true,
      };

      expect(isUser(validUser)).toBe(true);
    });

    it('returns false for invalid user object', () => {
      const invalidUser = {
        id: '1',
        name: 'John Doe',
        // Missing email
        role: 'user',
        createdAt: new Date(),
        isActive: true,
      };

      expect(isUser(invalidUser)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isUser(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isUser(undefined)).toBe(false);
    });
  });

  describe('isApiResponse', () => {
    it('returns true for valid API response', () => {
      const validResponse = {
        data: { id: '1', name: 'Test' },
        message: 'Success',
        success: true,
      };

      expect(isApiResponse(validResponse)).toBe(true);
    });

    it('returns false for invalid API response', () => {
      const invalidResponse = {
        data: { id: '1', name: 'Test' },
        // Missing message and success
      };

      expect(isApiResponse(invalidResponse)).toBe(false);
    });
  });
});
```

### Validation Testing

```typescript
// tests/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateCreateUser, validateUpdateUser } from '../../src/utils/validation';

describe('Validation Functions', () => {
  describe('validateCreateUser', () => {
    it('validates valid user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
      };

      const result = validateCreateUser(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('validates email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        role: 'user',
        isActive: true,
      };

      const result = validateCreateUser(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.email).toBe('Invalid email format');
    });

    it('validates name length', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        role: 'user',
        isActive: true,
      };

      const result = validateCreateUser(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.name).toBe('Name must be at least 2 characters');
    });

    it('validates role enum', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'invalid-role' as any,
        isActive: true,
      };

      const result = validateCreateUser(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.role).toBe('Please select a valid role');
    });
  });
});
```

## Integration Testing

### User Flow Testing

```typescript
// tests/integration/userFlow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/app/App';

// Mock the API client
vi.mock('../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '../../src/services/apiClient';

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes user creation flow', async () => {
    // Mock API responses
    (apiClient.get as any).mockResolvedValue({
      success: true,
      data: [],
      message: 'Success',
    });

    (apiClient.post as any).mockResolvedValue({
      success: true,
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: new Date(),
        isActive: true,
      },
      message: 'Success',
    });

    render(<App />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Click add user button
    const addUserButton = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(addUserButton);

    // Fill form
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'user');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add user/i });
    await userEvent.click(submitButton);

    // Verify user was created
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(apiClient.post).toHaveBeenCalledWith('/users', {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      isActive: true,
    });
  });

  it('completes user editing flow', async () => {
    const existingUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date(),
      isActive: true,
    };

    // Mock API responses
    (apiClient.get as any).mockResolvedValue({
      success: true,
      data: [existingUser],
      message: 'Success',
    });

    (apiClient.put as any).mockResolvedValue({
      success: true,
      data: { ...existingUser, name: 'John Updated' },
      message: 'Success',
    });

    render(<App />);

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);

    // Update name
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Updated');

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);

    // Verify user was updated
    await waitFor(() => {
      expect(screen.getByText('John Updated')).toBeInTheDocument();
    });

    expect(apiClient.put).toHaveBeenCalledWith('/users/1', {
      name: 'John Updated',
    });
  });
});
```

## Mocking Strategies

### API Mocking

```typescript
// tests/mocks/apiClient.ts
import { vi } from 'vitest';
import type { User, UserFormData } from '../../src/types';

export const createMockApiClient = () => {
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: new Date('2023-01-15'),
      isActive: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'admin',
      createdAt: new Date('2023-02-20'),
      isActive: true,
    },
  ];

  return {
    get: vi.fn().mockImplementation(async (url: string) => {
      if (url === '/users') {
        return {
          success: true,
          data: mockUsers,
          message: 'Users fetched successfully',
        };
      }
      return {
        success: false,
        data: null,
        message: 'Not found',
      };
    }),

    post: vi.fn().mockImplementation(async (url: string, data: UserFormData) => {
      if (url === '/users') {
        const newUser: User = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date(),
        };
        mockUsers.push(newUser);
        return {
          success: true,
          data: newUser,
          message: 'User created successfully',
        };
      }
      return {
        success: false,
        data: null,
        message: 'Not implemented',
      };
    }),

    put: vi.fn().mockImplementation(async (url: string, data: Partial<UserFormData>) => {
      if (url.startsWith('/users/')) {
        const userId = url.split('/')[2];
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
          return {
            success: true,
            data: mockUsers[userIndex],
            message: 'User updated successfully',
          };
        }
      }
      return {
        success: false,
        data: null,
        message: 'User not found',
      };
    }),

    delete: vi.fn().mockImplementation(async (url: string) => {
      if (url.startsWith('/users/')) {
        const userId = url.split('/')[2];
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          mockUsers.splice(userIndex, 1);
          return {
            success: true,
            data: { id: userId },
            message: 'User deleted successfully',
          };
        }
      }
      return {
        success: false,
        data: null,
        message: 'User not found',
      };
    }),
  };
};
```

### Context Mocking

```typescript
// tests/mocks/context.tsx
import React from 'react';
import { vi } from 'vitest';
import type { DashboardContextType } from '../../src/context/DashboardProvider';

export const createMockDashboardContext = (): DashboardContextType => ({
  state: {
    users: [],
    metrics: [],
    isLoading: false,
    error: null,
    selectedUser: null,
  },
  actions: {
    loadUsers: vi.fn(),
    loadMetrics: vi.fn(),
    selectUser: vi.fn(),
    addUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
});

export const MockDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockContext = createMockDashboardContext();
  
  return (
    <div data-testid="mock-dashboard-provider">
      {children}
    </div>
  );
};
```

This comprehensive testing guide demonstrates how to test TypeScript React applications effectively, covering all aspects from unit tests to integration tests while maintaining type safety throughout the testing process.
