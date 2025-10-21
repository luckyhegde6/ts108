import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { DashboardProvider } from '../context/DashboardProvider';
import Dashboard from './Dashboard';
import UserDetails from './UserDetails';
import './App.css';

function App() {
  return (
    <Router>
      <DashboardProvider>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link to="/" className="text-xl font-bold text-gray-900">
                    TypeSafe Dashboard
                  </Link>
                </div>
                <div className="flex items-center space-x-8">
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/users" 
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Users
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Dashboard />} />
              <Route path="/users/:userId" element={<UserDetails />} />
            </Routes>
          </main>
        </div>
      </DashboardProvider>
    </Router>
  );
}

export default App;
