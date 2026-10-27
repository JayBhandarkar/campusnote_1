import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Trash2,
  Edit,
  Plus,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { api } from '../api/axios';
import { resourcesApi } from '../api/resources.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const MyUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [activeItem, setActiveItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyUploads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/resources');
      if (res.data?.success) {
        setUploads(res.data.data?.resources || []);
      }
    } catch (err) {
      toast.error('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyUploads();
  }, []);

  const openEditModal = (item) => {
    setActiveItem(item);
    setEditTitle(item.title);
    setEditDesc(item.description || '');
    setEditTags(item.tags?.join(', ') || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      await resourcesApi.updateResource(activeItem._id, {
        title: editTitle,
        description: editDesc,
        tags: editTags ? editTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      toast.success('Resource updated successfully');
      setEditModalOpen(false);
      fetchMyUploads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleteLoading(true);
      await resourcesApi.deleteResource(itemToDelete._id);
      toast.success('Resource deleted');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchMyUploads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Uploaded Materials
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your contributed lecture notes, question papers, and monitor their verification status.
          </p>
        </div>
        <Link to="/upload">
          <Button variant="primary" icon={Plus}>
            Upload New Resource
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : uploads.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {uploads.map((item) => (
              <div
                key={item._id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {item.resourceType}
                    </span>
                    <StatusBadge status={item.verificationStatus} type="verification" size="sm" />
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{item.academicYear}</span>
                  </div>

                  <Link
                    to={`/resources/${item._id}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 text-base block truncate"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700">
                      {item.subject?.name} ({item.subject?.code})
                    </span>
                    <span>•</span>
                    <span>
                      Unit {item.unit?.unitNumber}: {item.unit?.title}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      {item.downloadCount || 0} downloads
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <Link to={`/resources/${item._id}`}>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </Link>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="Edit info"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(item)}
                    className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete upload"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No uploaded materials yet"
          description="Contribute to CampusNotes by sharing your handwritten notes, previous exam papers, or assignment solutions."
          actionLabel="Upload First Material"
          onAction={() => (window.location.href = '/upload')}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Uploaded Material"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Resource Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Tags (comma separated)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={editLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete Uploaded Material"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};
