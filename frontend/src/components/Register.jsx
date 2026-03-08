import React, { useState } from 'react';
import { api } from '../services/api';

export function Register({ onLogin, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await api.register(email, username, password);
      setError('');
      setShowSuccess(true);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Codebase AI</h1>
          <p className="text-gray-400">Create your account</p>
        </div>
        
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {showSuccess && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
                Account created! Please sign in.
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#212121] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="johndoe"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#212121] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#212121] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : showSuccess ? 'Sign in' : 'Create Account'}
            </button>
          </form>
          
          {showSuccess && (
            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToLogin}
                className="text-[#22c55e] hover:underline font-medium"
              >
                Go to Sign in
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#22c55e] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
