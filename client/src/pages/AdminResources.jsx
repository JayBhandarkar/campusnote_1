import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, Search, Trash2, Eye, Download, ShieldAlert } from 'lucide-react';
import { adminApi } from '../api/admin.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [moderationStatus, setModerationStatus] = useState('all');
  const [verificationStatus, setVerificationStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetResource, setTargetResource] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (moderationStatus !== 'all') params.moderationStatus = moderationStatus;
      if (verificationStatus !== 'all') params.verificationStatus = verificationStatus;

      const res = await adminApi.getAllResources(params);
      if (res.success && res.data?.resources) {
        setResources(res.data.resources);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, moderationStatus, verificationStatus, page]);

  const confirmRemove = (res) => {
    setTargetResource(res);
    setDialogOpen(true);
  };

  const handleRemove = async () => {
    if (!targetResource) return;
    try {
      setActionLoading(true);
      await adminApi.removeResource(targetResource._id);
      toast.success('Resource marked as Removed and storage file cleaned up');
      setDialogOpen(false);
      setTargetResource(null);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove resource');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Resource Moderation
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Inspect all uploaded materials across the platform and remove inappropriate content with file cleanup.
        </p>
      </div>

      {/* Filter and Search */}
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
            placeholder="Search resources by title..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moderationStatus}
            onChange={(e) => {
              setModerationStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Moderation States</option>
            <option value="Active">Active</option>
            <option value="Removed">Removed</option>
          </select>

          <select
            value={verificationStatus}
            onChange={(e) => {
              setVerificationStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Verifications</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Title & Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Uploader</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Moderation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading resources...
                  </td>
                </tr>
              ) : resources.length > 0 ? (
                resources.map((res) => (
                  <tr key={res._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <Link to={`/resources/${res._id}`} className="font-bold text-slate-900 hover:text-indigo-600 block">
                        {res.title}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        {res.subject?.name} ({res.subject?.code}) • Unit {res.unit?.unitNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{res.resourceType}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{res.uploadedBy?.name}</div>
                      <div className="text-[10px] text-slate-400">{res.uploadedBy?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={res.verificationStatus} type="verification" size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          res.moderationStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {res.moderationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link to={`/resources/${res._id}`}>
                        <Button variant="secondary" size="sm">
                          Inspect
                        </Button>
                      </Link>
                      {res.moderationStatus !== 'Removed' && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => confirmRemove(res)}
                        >
                          Moderate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No resources found.
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

      <ConfirmDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleRemove}
        isLoading={actionLoading}
        title="Moderate & Remove Resource"
        message={`Are you sure you want to remove "${targetResource?.title}"? The resource status will be set to 'Removed' and its physical storage file deleted.`}
        confirmText="Remove Resource"
      />
    </div>
  );
};
