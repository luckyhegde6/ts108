# Typed Components Guide

This guide covers advanced TypeScript patterns for React components, including props typing, children handling, higher-order components (HOCs), and render props patterns used in the TypeSafe Dashboard.

## Table of Contents

1. [Basic Props Typing](#basic-props-typing)
2. [Children Patterns](#children-patterns)
3. [Generic Components](#generic-components)
4. [Higher-Order Components (HOCs)](#higher-order-components-hocs)
5. [Render Props Pattern](#render-props-pattern)
6. [Event Handler Typing](#event-handler-typing)
7. [Ref Forwarding](#ref-forwarding)
8. [Component Composition](#component-composition)

## Basic Props Typing

### Simple Props Interface

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium' 
}: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  );
}
```

### Extending Base Props

```typescript
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

interface CardProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  actions,
  variant = 'default',
  'data-testid': testId 
}: CardProps) {
  return (
    <div 
      className={`card card-${variant} ${className}`}
      data-testid={testId}
    >
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
        {actions && <div className="card-actions">{actions}</div>}
      </div>
      {children && <div className="card-content">{children}</div>}
    </div>
  );
}
```

## Children Patterns

### ReactNode Children

```typescript
interface ContainerProps {
  children: React.ReactNode; // Most flexible
}

interface StrictContainerProps {
  children: React.ReactElement; // Only React elements
}

interface TextContainerProps {
  children: string; // Only text content
}
```

### Function as Children (Render Props)

```typescript
interface DataProviderProps<T> {
  children: (data: T) => React.ReactNode;
  data: T;
}

export function DataProvider<T>({ children, data }: DataProviderProps<T>) {
  return <>{children(data)}</>;
}

// Usage
<DataProvider data={user}>
  {(user) => <div>Hello, {user.name}!</div>}
</DataProvider>
```

### Conditional Children

```typescript
interface ConditionalWrapperProps {
  condition: boolean;
  wrapper: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
}

export function ConditionalWrapper({ 
  condition, 
  wrapper, 
  children 
}: ConditionalWrapperProps) {
  return condition ? wrapper(children) : <>{children}</>;
}

// Usage
<ConditionalWrapper
  condition={isLoading}
  wrapper={(children) => <div className="loading">{children}</div>}
>
  <UserList users={users} />
</ConditionalWrapper>
```

## Generic Components

### Generic List Component

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
}

export function List<T>({ 
  items, 
  renderItem, 
  keyExtractor, 
  emptyMessage = 'No items found',
  className = '' 
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className={`empty-state ${className}`}>{emptyMessage}</div>;
  }

  return (
    <div className={`list ${className}`}>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

// Usage
<List
  items={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />}
/>
```

### Generic Form Component

```typescript
interface FormFieldProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  error?: string;
}

export function FormField<T>({ 
  name, 
  value, 
  onChange, 
  label, 
  type = 'text',
  required = false,
  error 
}: FormFieldProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value as T[keyof T]);
  };

  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value as string}
        onChange={handleChange}
        className={`form-input ${error ? 'error' : ''}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
```

## Higher-Order Components (HOCs)

### With Loading HOC

```typescript
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent(props: P & WithLoadingProps) {
    const { isLoading, ...restProps } = props;
    
    if (isLoading) {
      return <div className="loading-spinner">Loading...</div>;
    }
    
    return <Component {...(restProps as P)} />;
  };
}

// Usage
const UserListWithLoading = withLoading(UserList);

<UserListWithLoading 
  users={users} 
  isLoading={loading}
  onUserSelect={handleSelect}
/>
```

### With Error Boundary HOC

```typescript
interface WithErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  WithErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WithErrorBoundaryState {
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

function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## Render Props Pattern

### Data Fetching Render Prop

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {({ data, loading, error, refetch }) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data</div>;
    
    return (
      <div>
        <button onClick={refetch}>Refresh</button>
        <UserList users={data} />
      </div>
    );
  }}
</DataFetcher>
```

### Form Render Prop

```typescript
interface FormRenderProps<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  handleChange: (name: keyof T, value: T[keyof T]) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isValid: boolean;
}

interface FormProps<T> {
  initialValues: T;
  validationSchema?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
  children: (props: FormRenderProps<T>) => React.ReactNode;
}

export function Form<T>({ 
  initialValues, 
  validationSchema, 
  onSubmit, 
  children 
}: FormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (validationSchema) {
      const fieldErrors = validationSchema(values);
      if (fieldErrors[name]) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationSchema) {
      const validationErrors = validationSchema(values);
      setErrors(validationErrors);
      setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
      
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = Object.keys(errors).length === 0;

  return (
    <form onSubmit={handleSubmit}>
      {children({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        isValid,
      })}
    </form>
  );
}
```

## Event Handler Typing

### Form Event Handlers

```typescript
interface FormHandlers {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTextareaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const useFormHandlers = <T>(setValues: (values: T) => void): FormHandlers => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return {
    handleSubmit,
    handleInputChange,
    handleSelectChange,
    handleTextareaChange,
  };
};
```

### Mouse and Keyboard Events

```typescript
interface InteractiveHandlers {
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const useInteractiveHandlers = (): InteractiveHandlers => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Handle click
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle double click
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Handle Enter key
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle key up
  };

  return {
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    handleKeyUp,
  };
};
```

## Ref Forwarding

### Basic Ref Forwarding

```typescript
interface InputProps {
  label?: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <input
          ref={ref}
          className={`input ${error ? 'error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Ref Forwarding with Generic Types

```typescript
interface GenericInputProps<T> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  error?: string;
}

const GenericInput = React.forwardRef<
  HTMLInputElement,
  GenericInputProps<string | number>
>(({ value, onChange, label, error, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = props.type === 'number' 
      ? parseFloat(e.target.value) 
      : e.target.value;
    onChange(newValue as typeof value);
  };

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input
        ref={ref}
        value={value}
        onChange={handleChange}
        className={`input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

GenericInput.displayName = 'GenericInput';
```

## Component Composition

### Compound Components

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface ModalSubComponents {
  Header: React.FC<{ children: React.ReactNode }>;
  Body: React.FC<{ children: React.ReactNode }>;
  Footer: React.FC<{ children: React.ReactNode }>;
}

const Modal: React.FC<ModalProps> & ModalSubComponents = ({ 
  isOpen, 
  onClose, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

Modal.Header = ({ children }) => (
  <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }) => (
  <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
  <div className="modal-footer">{children}</div>
);

// Usage
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>
    <h2>Edit User</h2>
  </Modal.Header>
  <Modal.Body>
    <UserForm user={user} onSubmit={handleSubmit} />
  </Modal.Body>
  <Modal.Footer>
    <button onClick={handleClose}>Cancel</button>
    <button onClick={handleSave}>Save</button>
  </Modal.Footer>
</Modal>
```

### Provider Pattern

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

This guide demonstrates advanced TypeScript patterns for React components, providing type safety, reusability, and maintainability. Each pattern is designed to work seamlessly with the TypeSafe Dashboard architecture while demonstrating best practices for modern React development.
