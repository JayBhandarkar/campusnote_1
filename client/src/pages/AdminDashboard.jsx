import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { adminApi } from '../api/admin.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getDashboardStats();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { stats, recentResources = [], pendingReports = [], recentUsers = [] } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Administration Dashboard
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          High-level overview of users, study materials, moderation reports, and academic structure.
        </p>
      </div>

      {/* 4 Primary Statistics Cards (Per Section 5.7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Students, Faculty & Admins</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Resources
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.totalResources || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Active notes, PPTs, & papers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Reports
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.pendingReports || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Requires review & resolution</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Subjects
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.totalSubjects || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Across all departments</p>
        </div>
      </div>

      {/* Practical Management Tables (Section 5.7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resources Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Recent Materials</h3>
            <Link to="/admin/resources" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {recentResources.map((res) => (
              <div key={res._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="min-w-0">
                  <Link to={`/resources/${res._id}`} className="font-semibold text-slate-800 hover:text-indigo-600 truncate block">
                    {res.title}
                  </Link>
                  <p className="text-[11px] text-slate-500">
                    {res.subject?.code} • By {res.uploadedBy?.name}
                  </p>
                </div>
                <StatusBadge status={res.verificationStatus} type="verification" size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Pending Issues & Reports</h3>
            <Link to="/admin/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {pendingReports.length > 0 ? (
              pendingReports.map((rep) => (
                <div key={rep._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] mr-2">
                      {rep.reason}
                    </span>
                    <span className="text-slate-800 font-medium truncate">
                      {rep.resource?.title || 'Unknown Resource'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reported by {rep.reportedBy?.name}
                    </p>
                  </div>
                  <StatusBadge status={rep.status} type="reportStatus" size="sm" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">No pending reports!</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent User Registrations */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Recent User Registrations</h3>
          <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            <span>Manage All Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.role} type="role" size="sm" />
                  </td>
                  <td className="py-3 px-4">{u.department?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={u.isActive} type="active" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
