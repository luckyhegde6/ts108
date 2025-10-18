# TypeScript + React Interview Questions

This document contains comprehensive interview questions covering TypeScript and React topics demonstrated in the TypeSafe Dashboard project. These questions range from basic to advanced levels and include practical coding scenarios.

## Table of Contents

1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [React + TypeScript Integration](#react--typescript-integration)
3. [Advanced TypeScript Patterns](#advanced-typescript-patterns)
4. [State Management](#state-management)
5. [API and Data Fetching](#api-and-data-fetching)
6. [Testing](#testing)
7. [Performance and Optimization](#performance-and-optimization)
8. [Architecture and Design Patterns](#architecture-and-design-patterns)

## TypeScript Fundamentals

### Q1: What are the benefits of using TypeScript's strict mode?

**Answer:**
TypeScript's strict mode enables several compiler flags that catch potential runtime errors at compile time:

- `strict`: Enables all strict type checking options
- `noImplicitAny`: Prevents variables from having an implicit `any` type
- `strictNullChecks`: Prevents `null` and `undefined` from being assignable to any type
- `noImplicitReturns`: Ensures all code paths return a value
- `noUnusedLocals`/`noUnusedParameters`: Catches unused variables/parameters

**Example:**
```typescript
// Without strict mode - this compiles but will fail at runtime
function getUser(id: number) {
  return users.find(user => user.id === id); // Returns User | undefined
}

// With strict mode - TypeScript forces you to handle the undefined case
function getUser(id: number): User | undefined {
  return users.find(user => user.id === id);
}

// Or with proper error handling
function getUser(id: number): User {
  const user = users.find(user => user.id === id);
  if (!user) {
    throw new Error(`User with id ${id} not found`);
  }
  return user;
}
```

### Q2: Explain the difference between `interface` and `type` in TypeScript.

**Answer:**
Both can define object shapes, but they have key differences:

**Interfaces:**
- Can be extended and merged
- Better for object shapes
- Support declaration merging
- Can be implemented by classes

**Types:**
- More flexible (unions, intersections, primitives)
- Cannot be merged
- Better for complex type operations
- Cannot be implemented by classes

**Example:**
```typescript
// Interface - can be extended
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Type - more flexible
type UserRole = 'admin' | 'user' | 'moderator';
type UserWithRole = User & { role: UserRole };

// Union types
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
```

### Q3: What are utility types and how do you use them?

**Answer:**
Utility types are built-in TypeScript types that help transform existing types:

**Common Utility Types:**
- `Partial<T>`: Makes all properties optional
- `Required<T>`: Makes all properties required
- `Pick<T, K>`: Selects specific properties
- `Omit<T, K>`: Excludes specific properties
- `Record<K, V>`: Creates object type with specific keys and values

**Example:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Update form only needs some fields
type UserUpdateForm = Partial<Pick<User, 'name' | 'email'>>;

// Create form omits auto-generated fields
type UserCreateForm = Omit<User, 'id' | 'createdAt'>;

// Custom utility type
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type UserWithOptionalEmail = Optional<User, 'email'>;
```

## React + TypeScript Integration

### Q4: How do you type React component props?

**Answer:**
There are several patterns for typing React component props:

**Basic Props Interface:**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

**Generic Component Props:**
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
```

**Event Handler Typing:**
```typescript
interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

### Q5: How do you handle children in TypeScript React components?

**Answer:**
There are different ways to type children depending on the use case:

**ReactNode (Most Flexible):**
```typescript
interface ContainerProps {
  children: React.ReactNode; // Accepts any valid React child
}
```

**ReactElement (Only React Elements):**
```typescript
interface StrictContainerProps {
  children: React.ReactElement; // Only React elements, not strings/numbers
}
```

**Function as Children (Render Props):**
```typescript
interface DataProviderProps<T> {
  children: (data: T) => React.ReactNode;
  data: T;
}

export function DataProvider<T>({ children, data }: DataProviderProps<T>) {
  return <>{children(data)}</>;
}
```

**Specific Children Types:**
```typescript
interface TextContainerProps {
  children: string; // Only text content
}

interface ButtonGroupProps {
  children: React.ReactElement<ButtonProps>[]; // Array of Button components
}
```

### Q6: How do you type custom hooks in TypeScript?

**Answer:**
Custom hooks should have proper return type annotations:

**Basic Hook:**
```typescript
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useCounter(initialValue: number = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(prev => prev + 1), []);
  const decrement = useCallback(() => setCount(prev => prev - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
```

**Generic Hook:**
```typescript
interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(url: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
```

## Advanced TypeScript Patterns

### Q7: What are discriminated unions and how do you use them?

**Answer:**
Discriminated unions use a common property (discriminant) to distinguish between different types:

**Basic Example:**
```typescript
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };

function handleState(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return 'Ready to load';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded ${state.data.length} users`; // TypeScript knows data exists
    case 'error':
      return `Error: ${state.error}`; // TypeScript knows error exists
  }
}
```

**Action Pattern:**
```typescript
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SELECT_USER'; payload: User | null };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }; // payload is boolean
    case 'SET_USERS':
      return { ...state, users: action.payload }; // payload is User[]
    // TypeScript ensures all cases are handled
  }
}
```

### Q8: How do you create type-safe generic components?

**Answer:**
Generic components allow you to create reusable components that work with different types:

**Generic List Component:**
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export function List<T>({ 
  items, 
  renderItem, 
  keyExtractor, 
  emptyMessage = 'No items found' 
}: ListProps<T>) {
  if (items.length === 0) {
    return <div>{emptyMessage}</div>;
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Usage with type inference
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />} // user is typed as User
/>
```

**Generic Form Component:**
```typescript
interface FormFieldProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
}

export function FormField<T>({ 
  name, 
  value, 
  onChange, 
  label, 
  type = 'text' 
}: FormFieldProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value as T[keyof T]);
  };

  return (
    <div>
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value as string}
        onChange={handleChange}
      />
    </div>
  );
}
```

### Q9: How do you implement type guards in TypeScript?

**Answer:**
Type guards are functions that narrow types at runtime:

**Basic Type Guard:**
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    typeof (obj as any).id === 'string' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).email === 'string'
  );
}

// Usage
function processData(data: unknown) {
  if (isUser(data)) {
    // TypeScript now knows data is User
    console.log(data.name); // No error
  }
}
```

**Discriminated Union Type Guard:**
```typescript
function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

function handleResponse<T>(response: ApiResponse<T>) {
  if (isSuccessResponse(response)) {
    // TypeScript knows response.data exists
    return response.data;
  } else {
    // TypeScript knows response.error exists
    throw new Error(response.error);
  }
}
```

## State Management

### Q10: How do you implement type-safe React Context?

**Answer:**
React Context with TypeScript requires proper typing of the context value and error handling:

**Basic Typed Context:**
```typescript
interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const value: AppContextType = {
    user,
    theme,
    setUser,
    setTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}
```

**Context with useReducer:**
```typescript
interface DashboardState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const value: DashboardContextType = {
    state,
    dispatch,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
```

### Q11: How do you optimize Context performance with TypeScript?

**Answer:**
Context performance can be optimized by splitting contexts and using memoization:

**Context Splitting:**
```typescript
// Split contexts to prevent unnecessary re-renders
const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
} | undefined>(undefined);

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
} | undefined>(undefined);

// Separate providers
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const value = useMemo(() => ({
    user,
    setUser,
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
```

**Memoized Context Value:**
```typescript
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo(() => ({
    loadUsers: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      // ... async logic
    },
    selectUser: (user: User | null) => {
      dispatch({ type: 'SELECT_USER', payload: user });
    },
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
```

## API and Data Fetching

### Q12: How do you create a type-safe API client?

**Answer:**
A type-safe API client uses generics and proper error handling:

**Generic API Client:**
```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface ApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}

class TypedApiClient implements ApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return {
        data,
        message: 'Success',
        success: true,
      };
    } catch (error) {
      return {
        data: null as T,
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      };
    }
  }

  // ... implement other methods
}

export const apiClient = new TypedApiClient();

// Usage with type safety
const users = await apiClient.get<User[]>('/users');
if (users.success) {
  // users.data is typed as User[]
  console.log(users.data.length);
}
```

### Q13: How do you handle async operations with proper error handling?

**Answer:**
Proper error handling for async operations involves try-catch blocks and proper type checking:

**Basic Error Handling:**
```typescript
async function loadUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get<User[]>('/users');
    
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to load users');
    }
  } catch (error) {
    // Log error for debugging
    console.error('Failed to load users:', error);
    
    // Re-throw with proper typing
    throw error instanceof Error ? error : new Error('Unknown error');
  }
}
```

**Error Handling in Hooks:**
```typescript
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<User[]>('/users');
      
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refetch: loadUsers };
}
```

## Testing

### Q14: How do you test TypeScript React components?

**Answer:**
Testing TypeScript React components requires proper mocking and type safety:

**Component Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

**Hook Testing:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });
});
```

### Q15: How do you test Context providers?

**Answer:**
Testing Context providers requires creating test wrappers and testing the context behavior:

**Context Provider Testing:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../DashboardProvider';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardProvider>{children}</DashboardProvider>
);

describe('DashboardProvider', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });
    
    expect(result.current.state.users).toEqual([]);
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
});
```

## Performance and Optimization

### Q16: How do you optimize React components with TypeScript?

**Answer:**
Performance optimization in TypeScript React involves memoization and proper typing:

**Component Memoization:**
```typescript
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

export const UserCard = React.memo<UserCardProps>(({ user, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(user);
  }, [user, onSelect]);

  return (
    <div onClick={handleClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

UserCard.displayName = 'UserCard';
```

**Callback Memoization:**
```typescript
export function UserList({ users, onUserSelect }: UserListProps) {
  const handleUserSelect = useCallback((user: User) => {
    onUserSelect(user);
  }, [onUserSelect]);

  const memoizedUsers = useMemo(() => {
    return users.filter(user => user.isActive);
  }, [users]);

  return (
    <div>
      {memoizedUsers.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onSelect={handleUserSelect}
        />
      ))}
    </div>
  );
}
```

### Q17: How do you implement code splitting with TypeScript?

**Answer:**
Code splitting with TypeScript requires proper typing of lazy-loaded components:

**Lazy Loading Components:**
```typescript
import { lazy, Suspense } from 'react';

// Lazy load components with proper typing
const Dashboard = lazy(() => import('./Dashboard'));
const UserDetails = lazy(() => import('./UserDetails'));
const Settings = lazy(() => import('./Settings'));

// Type the lazy components
const LazyDashboard = Dashboard as React.LazyExoticComponent<React.ComponentType<{}>>;
const LazyUserDetails = UserDetails as React.LazyExoticComponent<React.ComponentType<{ userId: string }>>;

export function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LazyDashboard />} />
          <Route path="/users/:userId" element={<LazyUserDetails />} />
          <Route path="/settings" element={<LazySettings />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

## Architecture and Design Patterns

### Q18: How do you implement the Repository pattern with TypeScript?

**Answer:**
The Repository pattern abstracts data access and provides type safety:

**Repository Interface:**
```typescript
interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(userData: UserFormData): Promise<User>;
  update(id: string, userData: Partial<UserFormData>): Promise<User>;
  delete(id: string): Promise<void>;
}

class ApiUserRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<User[]> {
    const response = await this.apiClient.get<User[]>('/users');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to fetch users');
  }

  async findById(id: string): Promise<User | null> {
    const response = await this.apiClient.get<User>(`/users/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  }

  async create(userData: UserFormData): Promise<User> {
    const response = await this.apiClient.post<User>('/users', userData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error('Failed to create user');
  }

  // ... implement other methods
}

// Usage in service layer
class UserService {
  constructor(private userRepository: UserRepository) {}

  async getActiveUsers(): Promise<User[]> {
    const users = await this.userRepository.findAll();
    return users.filter(user => user.isActive);
  }
}
```

### Q19: How do you implement dependency injection with TypeScript?

**Answer:**
Dependency injection can be implemented using interfaces and constructor injection:

**Service Interfaces:**
```typescript
interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
}

interface UserService {
  getUsers(): Promise<User[]>;
  createUser(userData: UserFormData): Promise<User>;
}

// Implementations
class ConsoleLogger implements Logger {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(message, context);
  }
  
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(message, error, context);
  }
}

class ApiUserService implements UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async getUsers(): Promise<User[]> {
    try {
      this.logger.info('Fetching users');
      const users = await this.userRepository.findAll();
      this.logger.info(`Fetched ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error('Failed to fetch users', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  async createUser(userData: UserFormData): Promise<User> {
    try {
      this.logger.info('Creating user', { email: userData.email });
      const user = await this.userRepository.create(userData);
      this.logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error instanceof Error ? error : undefined);
      throw error;
    }
  }
}

// Dependency injection container
class Container {
  private services = new Map<string, unknown>();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }

  get<T>(name: string): T {
    const factory = this.services.get(name) as () => T;
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory();
  }
}

// Setup
const container = new Container();
container.register('logger', () => new ConsoleLogger());
container.register('userRepository', () => new ApiUserRepository(apiClient));
container.register('userService', () => new ApiUserService(
  container.get<UserRepository>('userRepository'),
  container.get<Logger>('logger')
));
```

### Q20: How do you implement error boundaries with TypeScript?

**Answer:**
Error boundaries in TypeScript require proper typing of error states and recovery mechanisms:

**Typed Error Boundary:**
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, retry: () => void) => React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

class TypedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error.stack}</pre>
          </details>
          {this.state.retryCount < (this.props.maxRetries || 3) && (
            <button onClick={this.handleRetry}>
              Try Again ({this.state.retryCount + 1}/{(this.props.maxRetries || 3) + 1})
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
export function App() {
  return (
    <TypedErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
        // Send to error reporting service
      }}
      fallback={(error, retry) => (
        <div className="error-fallback">
          <h2>Oops! Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      <DashboardProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users/:userId" element={<UserDetails />} />
          </Routes>
        </Router>
      </DashboardProvider>
    </TypedErrorBoundary>
  );
}
```

These interview questions cover the essential TypeScript and React concepts demonstrated in the TypeSafe Dashboard project, from basic type safety to advanced architectural patterns. They provide a comprehensive foundation for technical interviews focused on modern React development with TypeScript.
