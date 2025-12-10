import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAdminMe } from '../api/api';
import { FiLoader } from 'react-icons/fi';

const AdminProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      // Debug logging
      console.log('Admin token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify the token by making an API call
        const adminData = await getAdminMe();
        console.log('Admin authenticated:', adminData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Admin auth verification failed:', error);
        console.error('Error details:', error.response?.data);
        // Token is invalid or expired, remove it
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
          <FiLoader className="text-4xl animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render protected content
  return <Outlet />;
};

export default AdminProtectedRoute;
