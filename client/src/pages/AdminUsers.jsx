import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Edit,
  Shield,
  UserCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Edit Modal
  const [activeUser, setActiveUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('Student');
  const [newActive, setNewActive] = useState('true');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      if (activeFilter !== 'all') params.isActive = activeFilter;

      const res = await adminApi.getUsers(params);
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, roleFilter, activeFilter, page]);

  const openEditModal = (u) => {
    setActiveUser(u);
    setNewRole(u.role);
    setNewActive(u.isActive ? 'true' : 'false');
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!activeUser) return;

    try {
      setSubmitting(true);
      await adminApi.updateUser(activeUser._id, {
        role: newRole,
        isActive: newActive === 'true',
      });
      toast.success('User updated successfully');
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review accounts, grant Faculty or Administrator roles, and activate/deactivate accounts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.role} type="role" size="sm" />
                    </td>
                    <td className="py-3 px-4 font-medium">{u.department?.name || '—'}</td>
                    <td className="py-3 px-4">{u.semester ? `Sem ${u.semester}` : '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={u.isActive} type="active" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit}
                        onClick={() => openEditModal(u)}
                      >
                        Edit Role/Status
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalCount={meta.totalCount}
          limit={10}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Manage User: ${activeUser?.name || ''}`}
        subtitle={activeUser?.email}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <Select
            label="Account Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={[
              { value: 'Student', label: 'Student (Normal user privileges)' },
              { value: 'Faculty', label: 'Faculty (Verification privileges)' },
              { value: 'Admin', label: 'Admin (Full system privileges)' },
            ]}
            required
          />

          <Select
            label="Account Status"
            value={newActive}
            onChange={(e) => setNewActive(e.target.value)}
            options={[
              { value: 'true', label: 'Active (Permit login)' },
              { value: 'false', label: 'Deactivated (Block login)' },
            ]}
            required
          />

          {activeUser?._id === currentUser?._id && newActive === 'false' && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              Warning: You cannot deactivate your own administrative account.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Update User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
