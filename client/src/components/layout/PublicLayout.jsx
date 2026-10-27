import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const PublicLayout = () => {
  const { isAuthenticated, user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">
            CampusNotes
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/browse"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Materials</span>
          </Link>

          {isAuthenticated ? (
            <Link to={role === 'Admin' ? '/admin/dashboard' : '/dashboard'}>
              <Button size="sm" variant="primary">
                Open Dashboard ({role})
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" icon={LogIn}>
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary" icon={UserPlus}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Page Body */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">CampusNotes</span>
            <span>— Centralized Academic Study Material Sharing</span>
          </div>
          <p>© {new Date().getFullYear()} CampusNotes. Designed for Students & Faculty.</p>
        </div>
      </footer>
    </div>
  );
};
