# Forms and Validation with TypeScript

This guide covers advanced TypeScript patterns for form handling, validation, and data management used in the TypeSafe Dashboard project.

## Table of Contents

1. [Form State Management](#form-state-management)
2. [Validation with Zod](#validation-with-zod)
3. [Type-Safe Form Components](#type-safe-form-components)
4. [Error Handling](#error-handling)
5. [Form Composition](#form-composition)
6. [Testing Forms](#testing-forms)

## Form State Management

### Basic Form Hook

```typescript
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: keyof T, value: T[keyof T]) => void;
  setError: (name: keyof T, error: string) => void;
  setTouched: (name: keyof T, touched: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
}

export function useForm<T>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const setError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouched = useCallback((name: keyof T, touched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: touched }));
  }, []);

  const validate = useCallback((valuesToValidate: T): Partial<Record<keyof T, string>> => {
    if (!validationSchema) return {};
    return validationSchema(valuesToValidate);
  }, [validationSchema]);

  const isValid = useMemo(() => {
    const validationErrors = validate(values);
    return Object.keys(validationErrors).length === 0;
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    // Validate form
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setError,
    setTouched,
    handleSubmit,
    reset,
  };
}
```

### Generic Form Field Component

```typescript
interface FormFieldProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  onBlur: (name: keyof T) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormField<T>({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
}: FormFieldProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' 
      ? (e.target.valueAsNumber || 0) as T[keyof T]
      : e.target.value as T[keyof T];
    onChange(name, newValue);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const hasError = touched && error;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value as string | number}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-input ${hasError ? 'error' : ''}`}
      />
      {hasError && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
}
```

## Validation with Zod

### Schema Definition

```typescript
import { z } from 'zod';

// User form schemas
const CreateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  role: z.enum(['admin', 'user', 'moderator'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  isActive: z.boolean().default(true),
});

const UpdateUserSchema = CreateUserSchema.partial();

// Metric schemas
const MetricSchema = z.object({
  name: z.string().min(1, 'Metric name is required'),
  value: z.number().min(0, 'Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  trend: z.enum(['up', 'down', 'stable']),
  changePercent: z.number().min(-100).max(100),
});

// Type inference
type CreateUserFormData = z.infer<typeof CreateUserSchema>;
type UpdateUserFormData = z.infer<typeof UpdateUserSchema>;
type MetricFormData = z.infer<typeof MetricSchema>;
```

### Validation Functions

```typescript
// Generic validation function
export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        return { success: false, errors };
      }
      return { success: false, errors: { general: 'Validation failed' } };
    }
  };
}

// Specific validators
export const validateCreateUser = createValidator(CreateUserSchema);
export const validateUpdateUser = createValidator(UpdateUserSchema);
export const validateMetric = createValidator(MetricSchema);

// Validation hook
export function useValidation<T>(schema: z.ZodSchema<T>) {
  const validate = useCallback((data: unknown) => {
    return createValidator(schema)(data);
  }, [schema]);

  return { validate };
}
```

### Form with Zod Validation

```typescript
interface UserFormProps {
  initialValues?: Partial<CreateUserFormData>;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel?: () => void;
}

export function UserForm({ initialValues, onSubmit, onCancel }: UserFormProps) {
  const defaultValues: CreateUserFormData = {
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    ...initialValues,
  };

  const form = useForm({
    initialValues: defaultValues,
    validationSchema: (values) => {
      const result = validateCreateUser(values);
      return result.success ? {} : result.errors;
    },
    onSubmit,
  });

  return (
    <form onSubmit={form.handleSubmit} className="user-form">
      <FormField
        name="name"
        value={form.values.name}
        onChange={form.setValue}
        onBlur={form.setTouched}
        error={form.errors.name}
        touched={form.touched.name}
        label="Name"
        required
        placeholder="Enter user name"
      />

      <FormField
        name="email"
        value={form.values.email}
        onChange={form.setValue}
        onBlur={form.setTouched}
        error={form.errors.email}
        touched={form.touched.email}
        label="Email"
        type="email"
        required
        placeholder="Enter email address"
      />

      <div className="form-field">
        <label className="form-label">Role</label>
        <select
          value={form.values.role}
          onChange={(e) => form.setValue('role', e.target.value as CreateUserFormData['role'])}
          onBlur={() => form.setTouched('role', true)}
          className={`form-select ${form.touched.role && form.errors.role ? 'error' : ''}`}
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        {form.touched.role && form.errors.role && (
          <span className="error-message">{form.errors.role}</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-label">
          <input
            type="checkbox"
            checked={form.values.isActive}
            onChange={(e) => form.setValue('isActive', e.target.checked)}
            className="form-checkbox"
          />
          Active User
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={!form.isValid || form.isSubmitting}
          className="btn btn-primary"
        >
          {form.isSubmitting ? 'Saving...' : 'Save User'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={form.isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
```

## Type-Safe Form Components

### Select Component

```typescript
interface SelectOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  onBlur: (name: keyof T) => void;
  options: SelectOption<T[keyof T]>[];
  error?: string;
  touched?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Select<T>({
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  touched,
  label,
  placeholder,
  required = false,
  disabled = false,
  className = '',
}: SelectProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(name, e.target.value as T[keyof T]);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const hasError = touched && error;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        value={value as string}
        onChange={handleChange}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        className={`form-select ${hasError ? 'error' : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
}
```

### Checkbox Component

```typescript
interface CheckboxProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  onBlur: (name: keyof T) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Checkbox<T>({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  label,
  required = false,
  disabled = false,
  className = '',
}: CheckboxProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.checked as T[keyof T]);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const hasError = touched && error;

  return (
    <div className={`form-field checkbox-field ${className}`}>
      <label className="form-label checkbox-label">
        <input
          type="checkbox"
          checked={value as boolean}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          disabled={disabled}
          className={`form-checkbox ${hasError ? 'error' : ''}`}
        />
        <span className="checkbox-text">
          {label}
          {required && <span className="required">*</span>}
        </span>
      </label>
      {hasError && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
}
```

### Textarea Component

```typescript
interface TextareaProps<T> {
  name: keyof T;
  value: T[keyof T];
  onChange: (name: keyof T, value: T[keyof T]) => void;
  onBlur: (name: keyof T) => void;
  error?: string;
  touched?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export function Textarea<T>({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
}: TextareaProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(name, e.target.value as T[keyof T]);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const hasError = touched && error;

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        value={value as string}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`form-textarea ${hasError ? 'error' : ''}`}
      />
      {maxLength && (
        <div className="character-count">
          {(value as string).length} / {maxLength}
        </div>
      )}
      {hasError && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
}
```

## Error Handling

### Form Error Display

```typescript
interface FormErrorProps {
  error: string;
  className?: string;
}

export function FormError({ error, className = '' }: FormErrorProps) {
  return (
    <div className={`form-error ${className}`}>
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3>Form Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );
}

interface FieldErrorProps {
  error: string;
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  return (
    <span className={`field-error ${className}`}>
      {error}
    </span>
  );
}
```

### Async Error Handling

```typescript
interface AsyncFormOptions<T> {
  initialValues: T;
  validationSchema?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
  onSuccess?: (values: T) => void;
  onError?: (error: Error) => void;
}

export function useAsyncForm<T>({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
}: AsyncFormOptions<T>) {
  const [asyncError, setAsyncError] = useState<string | null>(null);
  
  const form = useForm({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setAsyncError(null);
        await onSubmit(values);
        onSuccess?.(values);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setAsyncError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    },
  });

  return {
    ...form,
    asyncError,
    clearAsyncError: () => setAsyncError(null),
  };
}
```

## Form Composition

### Form Section Component

```typescript
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className = '' 
}: FormSectionProps) {
  return (
    <div className={`form-section ${className}`}>
      {title && <h3 className="form-section-title">{title}</h3>}
      {description && <p className="form-section-description">{description}</p>}
      <div className="form-section-content">
        {children}
      </div>
    </div>
  );
}
```

### Form Actions Component

```typescript
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className = '' }: FormActionsProps) {
  return (
    <div className={`form-actions ${className}`}>
      {children}
    </div>
  );
}
```

### Complete Form Example

```typescript
interface UserProfileFormProps {
  user: User;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  onCancel?: () => void;
}

export function UserProfileForm({ user, onSubmit, onCancel }: UserProfileFormProps) {
  const form = useAsyncForm({
    initialValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    validationSchema: (values) => {
      const result = validateUpdateUser(values);
      return result.success ? {} : result.errors;
    },
    onSubmit,
  });

  const roleOptions: SelectOption<User['role']>[] = [
    { value: 'user', label: 'User' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <form onSubmit={form.handleSubmit} className="user-profile-form">
      {form.asyncError && (
        <FormError error={form.asyncError} />
      )}

      <FormSection title="Basic Information">
        <FormField
          name="name"
          value={form.values.name}
          onChange={form.setValue}
          onBlur={form.setTouched}
          error={form.errors.name}
          touched={form.touched.name}
          label="Full Name"
          required
        />

        <FormField
          name="email"
          value={form.values.email}
          onChange={form.setValue}
          onBlur={form.setTouched}
          error={form.errors.email}
          touched={form.touched.email}
          label="Email Address"
          type="email"
          required
        />
      </FormSection>

      <FormSection title="Account Settings">
        <Select
          name="role"
          value={form.values.role}
          onChange={form.setValue}
          onBlur={form.setTouched}
          options={roleOptions}
          error={form.errors.role}
          touched={form.touched.role}
          label="User Role"
          required
        />

        <Checkbox
          name="isActive"
          value={form.values.isActive}
          onChange={form.setValue}
          onBlur={form.setTouched}
          error={form.errors.isActive}
          touched={form.touched.isActive}
          label="Account is active"
        />
      </FormSection>

      <FormActions>
        <button
          type="submit"
          disabled={!form.isValid || form.isSubmitting}
          className="btn btn-primary"
        >
          {form.isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={form.isSubmitting}
          >
            Cancel
          </button>
        )}
      </FormActions>
    </form>
  );
}
```

## Testing Forms

### Form Testing Utilities

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Test utilities for forms
export const formTestUtils = {
  // Fill form field
  fillField: async (name: string, value: string) => {
    const field = screen.getByLabelText(new RegExp(name, 'i'));
    await userEvent.clear(field);
    await userEvent.type(field, value);
  },

  // Select option from dropdown
  selectOption: async (name: string, value: string) => {
    const select = screen.getByLabelText(new RegExp(name, 'i'));
    await userEvent.selectOptions(select, value);
  },

  // Check checkbox
  checkCheckbox: async (name: string) => {
    const checkbox = screen.getByLabelText(new RegExp(name, 'i'));
    await userEvent.click(checkbox);
  },

  // Submit form
  submitForm: async () => {
    const submitButton = screen.getByRole('button', { name: /submit|save|update/i });
    await userEvent.click(submitButton);
  },

  // Wait for form submission
  waitForSubmission: async () => {
    await waitFor(() => {
      expect(screen.queryByText(/submitting|saving|updating/i)).not.toBeInTheDocument();
    });
  },
};
```

### Form Component Tests

```typescript
describe('UserForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/active user/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    await formTestUtils.submitForm();
    
    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    await formTestUtils.fillField('name', 'John Doe');
    await formTestUtils.fillField('email', 'john@example.com');
    await formTestUtils.selectOption('role', 'user');
    
    await formTestUtils.submitForm();
    await formTestUtils.waitForSubmission();
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      isActive: true,
    });
  });

  it('handles form cancellation', async () => {
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /save user/i });
    expect(submitButton).toBeDisabled();
    
    await formTestUtils.fillField('name', 'John Doe');
    await formTestUtils.fillField('email', 'john@example.com');
    
    expect(submitButton).not.toBeDisabled();
  });
});
```

### Validation Testing

```typescript
describe('User Form Validation', () => {
  it('validates email format', () => {
    const result = validateCreateUser({
      name: 'John Doe',
      email: 'invalid-email',
      role: 'user',
      isActive: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.email).toBe('Invalid email format');
  });

  it('validates name length', () => {
    const result = validateCreateUser({
      name: 'J',
      email: 'john@example.com',
      role: 'user',
      isActive: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.name).toBe('Name must be at least 2 characters');
  });

  it('validates role enum', () => {
    const result = validateCreateUser({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'invalid-role' as any,
      isActive: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.role).toBe('Please select a valid role');
  });
});
```

This guide demonstrates comprehensive TypeScript patterns for form handling, validation, and testing, providing a robust foundation for building type-safe forms in React applications.
