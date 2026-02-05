import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // If no token exists, redirect to login immediately
  if (!token) {
    return <Navigate to="/influencers/login" replace />;
  }

  // If token exists, allow access to the page
  return children;
};

export default ProtectedRoute;