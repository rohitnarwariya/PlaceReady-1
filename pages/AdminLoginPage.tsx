
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-set Admin credentials logic
    if (email === 'admin@placeready.com' && password === 'admin123') {
      localStorage.setItem('user_profile', JSON.stringify({
        name: 'Admin User',
        email: email,
        role: 'admin'
      }));
      localStorage.setItem('token', 'mock-jwt-token-admin');
      navigate('/admin-dashboard');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 fade-in">
      <div className="w-full max-w-md mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-900 font-bold transition-colors group text-sm"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Back
        </button>
      </div>
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-600"
              placeholder="admin@placeready.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-600"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-lg transition-all"
          >
            Login as Admin
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          This panel is for authorized administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
