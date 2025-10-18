import type { ApiClient, ApiResponse, User, Metric, UserFormData } from '../types';

class ApiClientImpl implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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

  async post<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result,
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

  async put<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result,
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

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${url}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        data: result,
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
}

// Mock data for development
const mockUsers: User[] = [
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
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=2',
    createdAt: new Date('2023-02-20'),
    lastLogin: new Date('2024-01-09'),
    isActive: true,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'moderator',
    avatar: 'https://i.pravatar.cc/150?img=3',
    createdAt: new Date('2023-03-10'),
    lastLogin: new Date('2024-01-08'),
    isActive: false,
  },
];

const mockMetrics: Metric[] = [
  {
    id: '1',
    name: 'Active Users',
    value: 1250,
    unit: 'users',
    trend: 'up',
    changePercent: 12.5,
    timestamp: new Date(),
  },
  {
    id: '2',
    name: 'Page Views',
    value: 45600,
    unit: 'views',
    trend: 'up',
    changePercent: 8.3,
    timestamp: new Date(),
  },
  {
    id: '3',
    name: 'Bounce Rate',
    value: 35.2,
    unit: '%',
    trend: 'down',
    changePercent: -5.1,
    timestamp: new Date(),
  },
];

// Mock API client for development
class MockApiClient implements ApiClient {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async get<T>(url: string): Promise<ApiResponse<T>> {
    await this.delay(500); // Simulate network delay
    
    if (url === '/users') {
      return {
        data: mockUsers as T,
        message: 'Users fetched successfully',
        success: true,
      };
    }
    
    if (url === '/metrics') {
      return {
        data: mockMetrics as T,
        message: 'Metrics fetched successfully',
        success: true,
      };
    }
    
    return {
      data: null as T,
      message: 'Not found',
      success: false,
    };
  }

  async post<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url === '/users') {
      const userData = data as UserFormData;
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 10)}`,
        createdAt: new Date(),
      };
      
      mockUsers.push(newUser);
      
      return {
        data: newUser as T,
        message: 'User created successfully',
        success: true,
      };
    }
    
    return {
      data: null as T,
      message: 'Not implemented',
      success: false,
    };
  }

  async put<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url.startsWith('/users/')) {
      const userId = url.split('/')[2];
      const userData = data as Partial<UserFormData>;
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        const existingUser = mockUsers[userIndex]!;
        const updatedUser: User = {
          id: existingUser.id,
          name: userData.name ?? existingUser.name,
          email: userData.email ?? existingUser.email,
          role: userData.role ?? existingUser.role,
          isActive: userData.isActive ?? existingUser.isActive,
          avatar: existingUser.avatar,
          createdAt: existingUser.createdAt,
          lastLogin: existingUser.lastLogin,
        };
        mockUsers[userIndex] = updatedUser;
        return {
          data: mockUsers[userIndex] as T,
          message: 'User updated successfully',
          success: true,
        };
      }
    }
    
    return {
      data: null as T,
      message: 'User not found',
      success: false,
    };
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    await this.delay(300);
    
    if (url.startsWith('/users/')) {
      const userId = url.split('/')[2];
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        return {
          data: { id: userId } as T,
          message: 'User deleted successfully',
          success: true,
        };
      }
    }
    
    return {
      data: null as T,
      message: 'User not found',
      success: false,
    };
  }
}

// Export the appropriate client based on environment
export const apiClient: ApiClient = import.meta.env.DEV 
  ? new MockApiClient() 
  : new ApiClientImpl();

export default apiClient;
