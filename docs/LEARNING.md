# Learning TypeScript with React

This document explains the TypeScript features and patterns used in the TypeSafe Dashboard project, designed to help you understand advanced TypeScript concepts in a React context.

## Table of Contents

1. [Strict TypeScript Configuration](#strict-typescript-configuration)
2. [Type-Safe Props](#type-safe-props)
3. [Discriminated Unions](#discriminated-unions)
4. [Generic Types](#generic-types)
5. [Context and State Management](#context-and-state-management)
6. [API Client Patterns](#api-client-patterns)
7. [Utility Types](#utility-types)
8. [Testing with Types](#testing-with-types)

## Strict TypeScript Configuration

Our `tsconfig.json` enables all strict flags:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### What Each Flag Does

- `strict`: Enables all strict type checking options
- `noUnusedLocals`: Error on unused local variables
- `noUnusedParameters`: Error on unused function parameters
- `exactOptionalPropertyTypes`: Distinguishes between `T` and `T | undefined`
- `noUncheckedIndexedAccess`: Adds `undefined` to index signature results

## Type-Safe Props

### Basic Props Interface

```typescript
interface UserRowProps {
  user: User;
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}
```

### Optional Props with Defaults

```typescript
interface CardProps extends BaseComponentProps {
  title: string;
  subtitle?: string;  // Optional
  actions?: React.ReactNode;
}

// Usage with defaults
export function Card({ 
  title, 
  subtitle, 
  children, 
  className = '',  // Default value
  actions 
}: CardProps) {
  // Implementation
}
```

### Generic Component Props

```typescript
interface MetricChartProps<T extends Metric> {
  metrics: T[];
  title: string;
  height?: number;
  renderMetric?: (metric: T) => React.ReactNode;
}
```

## Discriminated Unions

Discriminated unions provide type safety for state management:

```typescript
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SELECT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string };
```

### Reducer with Discriminated Unions

```typescript
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      // TypeScript knows action.payload is boolean
      return { ...state, isLoading: action.payload };
    
    case 'SET_USERS':
      // TypeScript knows action.payload is User[]
      return { ...state, users: action.payload };
    
    case 'DELETE_USER':
      // TypeScript knows action.payload is string
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    
    default:
      return state;
  }
}
```

## Generic Types

### Generic API Client

```typescript
interface ApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}

// Usage
const users = await apiClient.get<User[]>('/users');
// users is typed as Promise<ApiResponse<User[]>>
```

### Generic Hooks

```typescript
export function useApi<T>(url: string, immediate: boolean = true): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation
}

// Usage
const { data: users } = useApi<User[]>('/users');
// users is typed as User[] | null
```

## Context and State Management

### Typed Context

```typescript
interface DashboardContextType {
  state: DashboardState;
  actions: {
    loadUsers: () => Promise<void>;
    loadMetrics: () => Promise<void>;
    selectUser: (user: User | null) => void;
    addUser: (userData: UserFormData) => Promise<void>;
    updateUser: (id: string, userData: Partial<UserFormData>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);
```

### Custom Hook with Error Handling

```typescript
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}
```

## API Client Patterns

### Response Type Safety

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// Usage ensures type safety
const response = await apiClient.get<User[]>('/users');
if (response.success && response.data) {
  // response.data is typed as User[]
  dispatch({ type: 'SET_USERS', payload: response.data });
}
```

### Error Handling

```typescript
try {
  const response = await apiClient.get<User[]>('/users');
  if (response.success && response.data) {
    // Handle success
  } else {
    throw new Error(response.message || 'Failed to load users');
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  // Handle error with proper typing
}
```

## Utility Types

### Custom Utility Types

```typescript
// Make specific fields optional
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific fields required
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Usage examples
type UserUpdateData = Optional<UserFormData, 'isActive'>;
type UserCreateData = RequiredFields<UserFormData, 'email'>;
```

### Built-in Utility Types

```typescript
// Pick specific properties
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// Omit specific properties
type UserFormData = Omit<User, 'id' | 'createdAt' | 'lastLogin'>;

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;
```

## Testing with Types

### Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { Card } from '../components/ui/Card';

describe('Card Component', () => {
  it('renders with title', () => {
    render(<Card title="Test Card">Content</Card>);
    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../context/DashboardProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('useDashboard Hook', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    expect(result.current.state.users).toEqual([]);
    expect(typeof result.current.actions.loadUsers).toBe('function');
  });
});
```

## Best Practices

### 1. Avoid `any` Types

```typescript
// ❌ Bad
const data: any = await fetch('/api/users');

// ✅ Good
const data: User[] = await apiClient.get<User[]>('/users');
```

### 2. Use Type Guards

```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  );
}
```

### 3. Leverage Type Inference

```typescript
// TypeScript infers the return type
const getUserById = (id: string) => {
  return users.find(user => user.id === id);
  // Return type is User | undefined
};
```

### 4. Use Const Assertions

```typescript
const USER_ROLES = ['admin', 'user', 'moderator'] as const;
type UserRole = typeof USER_ROLES[number]; // 'admin' | 'user' | 'moderator'
```

## Common Patterns

### Event Handlers

```typescript
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Handle form submission
};

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};
```

### Ref Forwarding

```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`form-input ${className}`}
        {...props}
      />
    );
  }
);
```

This learning guide covers the essential TypeScript patterns used in the TypeSafe Dashboard. Each pattern is demonstrated with real code examples from the project, making it easier to understand how to apply these concepts in your own React applications.
