import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AvatarSelection } from './components/AvatarSelection';
import { Chat } from './components/Chat';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('codebase_ai_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AuthRoute({ children }) {
  const token = localStorage.getItem('codebase_ai_token');
  
  if (token) {
    return <Navigate to="/chat" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/avatar" element={<ProtectedRoute><AvatarWrapper /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
}

function AvatarWrapper() {
  const navigate = useNavigate();
  const username = localStorage.getItem('codebase_ai_username') || 'User';
  
  const handleComplete = (avatar) => {
    localStorage.setItem('codebase_ai_avatar', JSON.stringify(avatar));
    navigate('/login?registered=true');
  };
  
  return <AvatarSelection username={username} onComplete={handleComplete} />;
}

function RootRedirect() {
  const token = localStorage.getItem('codebase_ai_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to="/chat" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
