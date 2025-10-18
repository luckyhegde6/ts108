import React, { useEffect, useState } from 'react';
import { useDashboard } from '../context/DashboardProvider';
import { Card } from '../components/ui/Card';
import { UserList } from '../components/users/UserList';
import { MetricChart } from '../components/charts/MetricChart';
import type { UserFormData } from '../types';

export function Dashboard() {
  const { state, actions } = useDashboard();
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
  });

  useEffect(() => {
    actions.loadUsers();
    actions.loadMetrics();
  }, [actions]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actions.addUser(newUserData);
      setNewUserData({
        name: '',
        email: '',
        role: 'user',
        isActive: true,
      });
      setShowAddUserForm(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleUserSelect = (user: typeof state.users[0]) => {
    actions.selectUser(user);
  };

  const handleUserEdit = (user: typeof state.users[0]) => {
    // Navigate to user details page
    window.location.href = `/users/${user.id}`;
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await actions.deleteUser(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (state.isLoading && state.users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowAddUserForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add User
        </button>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <Card title="Metrics Overview">
        <MetricChart metrics={state.metrics} title="Key Performance Indicators" />
      </Card>

      {/* Users Section */}
      <Card 
        title="Users" 
        subtitle={`${state.users.length} total users`}
        actions={
          <button
            onClick={() => setShowAddUserForm(true)}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
          >
            Add User
          </button>
        }
      >
        <UserList
          users={state.users}
          selectedUserId={state.selectedUser?.id}
          onUserSelect={handleUserSelect}
          onUserEdit={handleUserEdit}
          onUserDelete={handleUserDelete}
        />
      </Card>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newUserData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUserData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={newUserData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={newUserData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUserForm(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
