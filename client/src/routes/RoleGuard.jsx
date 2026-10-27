import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, role } = useAuth();

  if (!user || !allowedRoles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 max-w-lg mx-auto">
        <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-600 mb-6">
          Your current role (<span className="font-semibold text-slate-800">{role}</span>) does not have permission to view this section. Allowed roles: {allowedRoles.join(', ')}.
        </p>
        <Button variant="primary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return children;
};
