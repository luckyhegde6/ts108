# Typed Context and State Management

This guide covers advanced TypeScript patterns for React Context, useReducer, and state management patterns used in the TypeSafe Dashboard project.

## Table of Contents

1. [Context Provider Patterns](#context-provider-patterns)
2. [useReducer with TypeScript](#usereducer-with-typescript)
3. [Typed Context Hooks](#typed-context-hooks)
4. [State Management Patterns](#state-management-patterns)
5. [Error Handling in Context](#error-handling-in-context)
6. [Performance Optimization](#performance-optimization)
7. [Testing Context](#testing-context)

## Context Provider Patterns

### Basic Typed Context

```typescript
// Define the context type
interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

// Create the context with undefined default
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setLoading] = useState(false);

  const value: AppContextType = {
    user,
    theme,
    isLoading,
    setUser,
    setTheme,
    setLoading,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook with error handling
export function useApp() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}
```

### Generic Context Provider

```typescript
interface GenericContextType<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function createGenericContext<T>() {
  const Context = createContext<GenericContextType<T> | undefined>(undefined);
  
  function Provider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data logic here
        const result = await fetchData<T>();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, []);

    const value: GenericContextType<T> = {
      data,
      loading,
      error,
      refetch,
    };

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  }

  function useContext() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error('useContext must be used within Provider');
    }
    return context;
  }

  return { Provider, useContext };
}

// Usage
const { Provider: UserProvider, useContext: useUserContext } = 
  createGenericContext<User[]>();
```

## useReducer with TypeScript

### Basic useReducer Pattern

```typescript
// Define action types with discriminated unions
type CounterAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'RESET' }
  | { type: 'SET_VALUE'; payload: number };

interface CounterState {
  count: number;
  history: number[];
}

// Reducer function with proper typing
function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + 1,
        history: [...state.history, state.count + 1],
      };
    
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1,
        history: [...state.history, state.count - 1],
      };
    
    case 'RESET':
      return {
        count: 0,
        history: [],
      };
    
    case 'SET_VALUE':
      return {
        ...state,
        count: action.payload,
        history: [...state.history, action.payload],
      };
    
    default:
      return state;
  }
}

// Component using the reducer
export function Counter() {
  const [state, dispatch] = useReducer(counterReducer, {
    count: 0,
    history: [],
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={() => dispatch({ type: 'SET_VALUE', payload: 10 })}>
        Set to 10
      </button>
    </div>
  );
}
```

### Complex State Management

```typescript
// Dashboard state and actions
interface DashboardState {
  users: User[];
  metrics: Metric[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    role: User['role'] | 'all';
    status: 'active' | 'inactive' | 'all';
  };
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_METRICS'; payload: Metric[] }
  | { type: 'SELECT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<DashboardState['filters']> }
  | { type: 'CLEAR_FILTERS' };

// Complex reducer with multiple action types
function dashboardReducer(
  state: DashboardState, 
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USERS':
      return { ...state, users: action.payload };
    
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    
    case 'SELECT_USER':
      return { ...state, selectedUser: action.payload };
    
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        selectedUser: state.selectedUser?.id === action.payload.id 
          ? action.payload 
          : state.selectedUser,
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUser: state.selectedUser?.id === action.payload 
          ? null 
          : state.selectedUser,
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { role: 'all', status: 'all' },
      };
    
    default:
      return state;
  }
}
```

## Typed Context Hooks

### Action Creators Pattern

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
    setFilter: (filter: Partial<DashboardState['filters']>) => void;
    clearFilters: () => void;
  };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Action creators with proper typing
  const actions = useMemo(() => ({
    loadUsers: async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await apiClient.get<User[]>('/users');
        
        if (response.success && response.data) {
          dispatch({ type: 'SET_USERS', payload: response.data });
        } else {
          throw new Error(response.message || 'Failed to load users');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadMetrics: async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await apiClient.get<Metric[]>('/metrics');
        
        if (response.success && response.data) {
          dispatch({ type: 'SET_METRICS', payload: response.data });
        } else {
          throw new Error(response.message || 'Failed to load metrics');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    selectUser: (user: User | null): void => {
      dispatch({ type: 'SELECT_USER', payload: user });
    },

    addUser: async (userData: UserFormData): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await apiClient.post<User>('/users', userData);
        
        if (response.success && response.data) {
          dispatch({ type: 'ADD_USER', payload: response.data });
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw for component handling
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    updateUser: async (id: string, userData: Partial<UserFormData>): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await apiClient.put<User>(`/users/${id}`, userData);
        
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_USER', payload: response.data });
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw for component handling
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    deleteUser: async (id: string): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const response = await apiClient.delete<{ id: string }>(`/users/${id}`);
        
        if (response.success) {
          dispatch({ type: 'DELETE_USER', payload: id });
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error; // Re-throw for component handling
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    setFilter: (filter: Partial<DashboardState['filters']>): void => {
      dispatch({ type: 'SET_FILTER', payload: filter });
    },

    clearFilters: (): void => {
      dispatch({ type: 'CLEAR_FILTERS' });
    },
  }), []);

  const value: DashboardContextType = {
    state,
    actions,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
```

## State Management Patterns

### Computed Values with useMemo

```typescript
export function useDashboard() {
  const { state, actions } = useContext(DashboardContext);
  
  // Computed values with proper typing
  const filteredUsers = useMemo(() => {
    return state.users.filter(user => {
      const roleMatch = state.filters.role === 'all' || user.role === state.filters.role;
      const statusMatch = state.filters.status === 'all' || 
        (state.filters.status === 'active' ? user.isActive : !user.isActive);
      return roleMatch && statusMatch;
    });
  }, [state.users, state.filters]);

  const userStats = useMemo(() => {
    const total = state.users.length;
    const active = state.users.filter(user => user.isActive).length;
    const inactive = total - active;
    const byRole = state.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<User['role'], number>);

    return {
      total,
      active,
      inactive,
      byRole,
    };
  }, [state.users]);

  const isLoading = useMemo(() => {
    return state.isLoading;
  }, [state.isLoading]);

  return {
    state,
    actions,
    filteredUsers,
    userStats,
    isLoading,
  };
}
```

### State Selectors Pattern

```typescript
// Selector functions for specific state slices
type StateSelector<T> = (state: DashboardState) => T;

const selectUsers: StateSelector<User[]> = (state) => state.users;
const selectMetrics: StateSelector<Metric[]> = (state) => state.metrics;
const selectSelectedUser: StateSelector<User | null> = (state) => state.selectedUser;
const selectIsLoading: StateSelector<boolean> = (state) => state.isLoading;
const selectError: StateSelector<string | null> = (state) => state.error;

// Custom hook with selectors
export function useDashboardSelector<T>(selector: StateSelector<T>): T {
  const { state } = useContext(DashboardContext);
  return selector(state);
}

// Usage
const users = useDashboardSelector(selectUsers);
const isLoading = useDashboardSelector(selectIsLoading);
```

## Error Handling in Context

### Error Boundary Integration

```typescript
interface ErrorContextType {
  error: string | null;
  clearError: () => void;
  setError: (error: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: string) => {
    setError(error);
  }, []);

  const value: ErrorContextType = {
    error,
    clearError,
    setError: handleError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// Error boundary component
class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Optimization

### Context Splitting

```typescript
// Split contexts to prevent unnecessary re-renders
const UserContext = createContext<{
  users: User[];
  selectedUser: User | null;
  selectUser: (user: User | null) => void;
} | undefined>(undefined);

const MetricsContext = createContext<{
  metrics: Metric[];
  loadMetrics: () => Promise<void>;
} | undefined>(undefined);

const LoadingContext = createContext<{
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
} | undefined>(undefined);

// Separate providers
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const selectUser = useCallback((user: User | null) => {
    setSelectedUser(user);
  }, []);

  const value = useMemo(() => ({
    users,
    selectedUser,
    selectUser,
  }), [users, selectedUser, selectUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

### Memoization Strategies

```typescript
// Memoize context value to prevent unnecessary re-renders
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo(() => ({
    // ... action creators
  }), []);

  const value = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Memoize components that consume context
export const UserList = React.memo(({ users, onUserSelect }: UserListProps) => {
  return (
    <div>
      {users.map(user => (
        <UserRow 
          key={user.id} 
          user={user} 
          onSelect={onUserSelect}
        />
      ))}
    </div>
  );
});
```

## Testing Context

### Testing Context Providers

```typescript
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider } from '../context/DashboardProvider';

// Test wrapper
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('DashboardProvider', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    expect(result.current.state.users).toEqual([]);
    expect(result.current.state.metrics).toEqual([]);
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.error).toBe(null);
  });

  it('handles user selection', () => {
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

  it('handles loading state', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    act(() => {
      result.current.actions.loadUsers();
    });

    expect(result.current.state.isLoading).toBe(true);
  });
});
```

### Testing Reducers

```typescript
import { dashboardReducer, initialState } from '../context/DashboardProvider';

describe('dashboardReducer', () => {
  it('handles SET_LOADING action', () => {
    const action: DashboardAction = { type: 'SET_LOADING', payload: true };
    const newState = dashboardReducer(initialState, action);
    
    expect(newState.isLoading).toBe(true);
  });

  it('handles SET_USERS action', () => {
    const users: User[] = [
      { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user', createdAt: new Date(), isActive: true },
    ];
    const action: DashboardAction = { type: 'SET_USERS', payload: users };
    const newState = dashboardReducer(initialState, action);
    
    expect(newState.users).toEqual(users);
  });

  it('handles DELETE_USER action', () => {
    const stateWithUsers: DashboardState = {
      ...initialState,
      users: [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'user', createdAt: new Date(), isActive: true },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'user', createdAt: new Date(), isActive: true },
      ],
    };
    
    const action: DashboardAction = { type: 'DELETE_USER', payload: '1' };
    const newState = dashboardReducer(stateWithUsers, action);
    
    expect(newState.users).toHaveLength(1);
    expect(newState.users[0].id).toBe('2');
  });
});
```

This guide demonstrates advanced TypeScript patterns for React Context and state management, providing type safety, performance optimization, and comprehensive testing strategies for complex state management scenarios.
