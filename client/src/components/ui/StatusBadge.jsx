import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck, UserCheck, Shield } from 'lucide-react';

export const StatusBadge = ({ status, type = 'verification', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  if (type === 'verification') {
    switch (status) {
      case 'Approved':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Faculty Verified</span>
          </span>
        );
      case 'Rejected':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case 'Pending':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  }

  if (type === 'role') {
    switch (status) {
      case 'Admin':
        return (
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin</span>
          </span>
        );
      case 'Faculty':
        return (
          <span
            className={`inline-flex items-center gap-1 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Faculty</span>
          </span>
        );
      case 'Student':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
          >
            <span>Student</span>
          </span>
        );
    }
  }

  if (type === 'reportStatus') {
    const config = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
      Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${config[status] || config.Pending}`}
      >
        {status}
      </span>
    );
  }

  // Active / Inactive
  if (type === 'active') {
    return status ? (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span>Active</span>
      </span>
    ) : (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-500 border border-slate-200 ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Inactive</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
      {status}
    </span>
  );
};
