import React from 'react';

// Core domain types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timestamp: Date;
}

export interface DashboardState {
  users: User[];
  metrics: Metric[];
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
}

// Action types for reducer
export type DashboardAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_METRICS'; payload: Metric[] }
  | { type: 'SELECT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string };

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface UserFormData {
  name: string;
  email: string;
  role: User['role'];
  isActive: boolean;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export interface UserRowProps {
  user: User;
  onSelect: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export interface UserListProps {
  users: User[];
  selectedUserId?: string;
  onUserSelect: (user: User) => void;
  onUserEdit: (user: User) => void;
  onUserDelete: (userId: string) => void;
}

export interface MetricChartProps {
  metrics: Metric[];
  title: string;
  height?: number;
}

// Hook return types
export interface UseDashboardReturn {
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

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Route types
export interface RouteParams {
  userId?: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Discriminated union for different metric types
export type MetricType = 
  | { type: 'performance'; value: number; unit: 'ms' }
  | { type: 'usage'; value: number; unit: '%' }
  | { type: 'count'; value: number; unit: 'items' };

// Generic API client types
export interface ApiClient {
  get<T>(url: string): Promise<ApiResponse<T>>;
  post<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  put<T>(url: string, data: unknown): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}
