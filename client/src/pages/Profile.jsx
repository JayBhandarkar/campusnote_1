import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Building, Layers, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/axios';
import { academicApi } from '../api/academic.api';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateUserProfile, role } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department?._id || user?.department || '');
  const [semester, setSemester] = useState(user?.semester?.toString() || '1');
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setDepartment(user.department?._id || user.department || '');
      setSemester(user.semester?.toString() || '1');
    }
  }, [user]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await academicApi.getDepartments();
        if (res.success && res.data?.departments) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch('/users/me', {
        name,
        department: department || null,
        semester: semester ? parseInt(semester, 10) : null,
      });

      if (res.data?.success && res.data.data?.user) {
        updateUserProfile(res.data.data.user);
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, department affiliation, and academic semester.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={role} type="role" size="sm" />
              <StatusBadge status={user?.isActive} type="active" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
          Personal Details
        </h3>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          required
        />

        <Input
          label="Email Address (read-only)"
          value={user?.email || ''}
          icon={Mail}
          disabled
          helperText="Email addresses are permanently bound to your institution account."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={departments.map((d) => ({
              value: d._id,
              label: `${d.name} (${d.code})`,
            }))}
            placeholder="Select Department"
          />

          <Select
            label="Semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
              value: s.toString(),
              label: `Semester ${s}`,
            }))}
            placeholder="Select Semester"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={saving} icon={Save}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
