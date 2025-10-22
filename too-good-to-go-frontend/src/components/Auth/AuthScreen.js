import React from "react";
import { useState } from "react";
const API_BASE_URL = "http://localhost:3001/api";

const AuthScreen = ({ setToken }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
      restaurantId: ''
    });
    const [error, setError] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
  
        const data = await response.json();
  
        if (response.ok) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        } else {
          setError(data.error || 'Authentication failed');
        }
      } catch (error) {
        setError('Network error. Please try again.');
      }
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-green-600">Green Meals</h1>
          
          <div className="flex mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 font-semibold ${isLogin ? 'bg-green-600 text-white' : 'bg-gray-200'} rounded-l-lg`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 font-semibold ${!isLogin ? 'bg-green-600 text-white' : 'bg-gray-200'} rounded-r-lg`}
            >
              Register
            </button>
          </div>
  
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
  
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
  
            {!isLogin && (
              <>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                />
                
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="customer">Customer</option>
                  <option value="restaurant">Restaurant Owner</option>
                </select>
  
              </>
            )}
  
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  export default AuthScreen;