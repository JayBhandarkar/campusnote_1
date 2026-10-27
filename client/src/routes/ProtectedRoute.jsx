/**
 * routes/ProtectedRoute.jsx — Frontend Route Guard
 *
 * Wraps private pages (e.g. Upload, Dashboard, Bookmarks, Admin):
 *  - If auth state is still loading from localStorage/API: displays a loading spinner.
 *  - If user is NOT logged in: redirects to `/login` and remembers the intended destination.
 *  - If authenticated: renders the wrapped child page component.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading CampusNotes...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
