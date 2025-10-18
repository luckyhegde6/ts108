# TypeSafe Dashboard

A modern React dashboard application built with TypeScript, demonstrating strict typing patterns, context-based state management, and comprehensive type safety across the entire application.

[![CI](https://github.com/luckyhegde6/ts108/workflows/CI/badge.svg)](https://github.com/luckyhegde6/ts108/actions)
[![Deployment](https://github.com/luckyhegde6/ts108/workflows/Deploy/badge.svg)](https://github.com/luckyhegde6/ts108/actions)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/luckyhegde6/ts108.git
cd ts108

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
npm run test         # Run tests
npm run coverage     # Run tests with coverage
```

## 🏗️ Architecture

This project demonstrates advanced TypeScript patterns in a React application:

### Type Safety Features

- **Strict TypeScript Configuration**: All `--strict` flags enabled
- **No `any` Types**: Comprehensive typing throughout the application
- **Discriminated Unions**: Type-safe state management with action types
- **Generic Types**: Reusable API client and hooks
- **Utility Types**: `Omit`, `Pick`, `Partial`, and custom utility types

### State Management

- **React Context + useReducer**: Type-safe global state management
- **Typed Actions**: Discriminated union for all state actions
- **Derived State**: Computed values with proper typing

### Component Architecture

- **Strict Props Typing**: All components have explicit prop interfaces
- **Generic Components**: Reusable components with type parameters
- **Render Props Pattern**: Type-safe component composition

## 📁 Project Structure

```
src/
├── app/                 # Main application components
│   ├── App.tsx         # Root component with routing
│   ├── Dashboard.tsx   # Main dashboard page
│   └── UserDetails.tsx # User detail/edit page
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── users/         # User-specific components
│   └── charts/        # Chart components
├── context/           # React Context providers
├── hooks/             # Custom hooks
├── services/          # API client and external services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── test/              # Test setup files
```

## 🔧 Type Safety Examples

### Strict Props Typing

```typescript
interface UserRowProps {
  user: User;
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserRow({ user, onSelect, onEdit, onDelete }: UserRowProps) {
  // Component implementation with full type safety
}
```

### Discriminated Union Actions

```typescript
type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SELECT_USER'; payload: User | null };
```

### Generic API Client

```typescript
interface ApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}
```

## 🧪 Testing

The project includes comprehensive testing with:

- **Unit Tests**: Component and hook testing with React Testing Library
- **Type Tests**: Ensuring type safety in tests
- **Integration Tests**: End-to-end user flows
- **Coverage**: Minimum 85% code coverage requirement

```bash
# Run tests
npm run test

# Run tests with coverage
npm run coverage
```

## 📚 Documentation

- [LEARNING.md](./docs/LEARNING.md) - TypeScript features and patterns used
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Detailed architecture overview
- [GUIDES/](./docs/GUIDES/) - Focused guides on specific topics
- [INTERVIEW_QUESTIONS.md](./docs/INTERVIEW_QUESTIONS.md) - Common TypeScript + React questions

## 🚀 Deployment

The application is automatically deployed to GitHub Pages on every push to main:

- **Live Demo**: [https://luckyhegde6.github.io/ts108](https://luckyhegde6.github.io/ts108)
- **CI/CD**: Automated testing and deployment via GitHub Actions

## 🛠️ Development

### Type Safety Validation

The project includes examples of intentional type errors to demonstrate compile-time safety:

```typescript
// This will cause a TypeScript error:
const user: User = {
  id: 123, // Error: Type 'number' is not assignable to type 'string'
  name: 'John',
  // Error: Missing required properties
};
```

### Adding New Features

When adding new features, ensure:

1. All props are strictly typed
2. No `any` types are used
3. Tests are written for new functionality
4. Documentation is updated

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Add tests for new functionality
5. Ensure all tests pass and coverage is maintained
6. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.
