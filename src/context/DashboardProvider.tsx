import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { DashboardState, DashboardAction, User, Metric, UserFormData } from '../types';
import { apiClient } from '../services/apiClient';
import { logger } from '../utils/logger';

// Initial state
const initialState: DashboardState = {
  users: [],
  metrics: [],
  isLoading: false,
  error: null,
  selectedUser: null,
};

// Reducer function
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
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
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        selectedUser: state.selectedUser?.id === action.payload ? null : state.selectedUser,
      };
    
    default:
      return state;
  }
}

// Context type
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

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = {
    loadUsers: async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        logger.info('Loading users...');
        const response = await apiClient.get<User[]>('/users');
        
        if (response.success && response.data) {
          dispatch({ type: 'SET_USERS', payload: response.data });
          logger.info('Users loaded successfully', { count: response.data.length });
        } else {
          throw new Error(response.message || 'Failed to load users');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to load users', error instanceof Error ? error : undefined);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    loadMetrics: async (): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        logger.info('Loading metrics...');
        const response = await apiClient.get<Metric[]>('/metrics');
        
        if (response.success && response.data) {
          dispatch({ type: 'SET_METRICS', payload: response.data });
          logger.info('Metrics loaded successfully', { count: response.data.length });
        } else {
          throw new Error(response.message || 'Failed to load metrics');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to load metrics', error instanceof Error ? error : undefined);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    selectUser: (user: User | null): void => {
      dispatch({ type: 'SELECT_USER', payload: user });
      logger.info('User selected', { userId: user?.id });
    },

    addUser: async (userData: UserFormData): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        logger.info('Creating user...', { email: userData.email });
        const response = await apiClient.post<User>('/users', userData);
        
        if (response.success && response.data) {
          dispatch({ type: 'ADD_USER', payload: response.data });
          logger.info('User created successfully', { userId: response.data.id });
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to create user', error instanceof Error ? error : undefined);
        throw error; // Re-throw to allow component to handle
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    updateUser: async (id: string, userData: Partial<UserFormData>): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        logger.info('Updating user...', { userId: id });
        const response = await apiClient.put<User>(`/users/${id}`, userData);
        
        if (response.success && response.data) {
          dispatch({ type: 'UPDATE_USER', payload: response.data });
          logger.info('User updated successfully', { userId: id });
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to update user', error instanceof Error ? error : undefined);
        throw error; // Re-throw to allow component to handle
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    deleteUser: async (id: string): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        logger.info('Deleting user...', { userId: id });
        const response = await apiClient.delete<{ id: string }>(`/users/${id}`);
        
        if (response.success) {
          dispatch({ type: 'DELETE_USER', payload: id });
          logger.info('User deleted successfully', { userId: id });
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logger.error('Failed to delete user', error instanceof Error ? error : undefined);
        throw error; // Re-throw to allow component to handle
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
  };

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

// Custom hook to use dashboard context
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  
  return context;
}

export default DashboardProvider;
