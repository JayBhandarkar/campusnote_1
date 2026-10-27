import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Download,
  Bookmark,
  Share2,
  AlertTriangle,
  BookOpen,
  Layers,
  Calendar,
  User,
  ShieldCheck,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { resourcesApi } from '../api/resources.api';
import { bookmarksApi } from '../api/bookmarks.api';
import { reportsApi } from '../api/reports.api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PDFViewer } from '../components/ui/PDFViewer';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isFaculty, isAdmin } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Wrong or Irrelevant Material');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('Approved');
  const [verifyNote, setVerifyNote] = useState('');
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await resourcesApi.getResourceById(id);
      if (res.success && res.data?.resource) {
        setResource(res.data.resource);
        setIsBookmarked(res.data.resource.isBookmarked || false);
        setEditTitle(res.data.resource.title);
        setEditDesc(res.data.resource.description || '');
        setEditTags(res.data.resource.tags?.join(', ') || '');
      }
    } catch (err) {
      toast.error('Resource could not be loaded');
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to bookmark resources');
      return;
    }
    try {
      setBookmarkLoading(true);
      if (isBookmarked) {
        await bookmarksApi.removeBookmark(resource._id);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await bookmarksApi.addBookmark(resource._id);
        setIsBookmarked(true);
        toast.success('Resource saved to bookmarks');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleDownload = () => {
    window.location.href = resourcesApi.getDownloadUrl(resource._id);
    // Optimistically bump count
    setResource((prev) => ({
      ...prev,
      downloadCount: (prev?.downloadCount || 0) + 1,
    }));
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      setReportSubmitting(true);
      await reportsApi.createReport(resource._id, {
        reason: reportReason,
        details: reportDetails,
      });
      toast.success('Report submitted to administrators for review');
      setReportModalOpen(false);
      setReportDetails('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      setVerifySubmitting(true);
      const res = await resourcesApi.verifyResource(resource._id, {
        status: verifyStatus,
        note: verifyNote,
      });
      toast.success(`Resource marked as ${verifyStatus}`);
      setResource(res.data.resource);
      setVerifyModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update verification');
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    try {
      setDeleteLoading(true);
      await resourcesApi.deleteResource(resource._id);
      toast.success('Resource deleted successfully');
      navigate('/browse');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const res = await resourcesApi.updateResource(resource._id, {
        title: editTitle,
        description: editDesc,
        tags: editTags ? editTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      toast.success('Resource metadata updated');
      setResource(res.data.resource);
      setEditModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!resource) return null;

  const isOwner = user && (user._id === resource.uploadedBy?._id || user._id === resource.uploadedBy);
  const canEditOrDelete = isOwner || isAdmin;
  const canVerify = isFaculty || isAdmin;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to materials</span>
        </button>

        <div className="flex items-center gap-2">
          <span>{resource.department?.code}</span>
          <span>/</span>
          <span>Semester {resource.semester}</span>
          <span>/</span>
          <span className="font-semibold text-slate-700">{resource.subject?.code}</span>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
        {/* Title and Badges */}
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {resource.resourceType}
            </span>
            <StatusBadge status={resource.verificationStatus} type="verification" size="sm" />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {resource.academicYear}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {resource.title}
          </h2>
        </div>

        {/* Academic Hierarchy Pill Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Subject & Code
            </span>
            <p className="font-semibold text-slate-800">
              {resource.subject?.name} ({resource.subject?.code})
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Unit Module
            </span>
            <p className="font-semibold text-slate-800">
              Unit {resource.unit?.unitNumber}: {resource.unit?.title}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Department & Semester
            </span>
            <p className="font-semibold text-slate-800">
              {resource.department?.name} • Sem {resource.semester}
            </p>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Description & Topics Covered
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Uploader & Verification Info */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
              {resource.uploadedBy?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Uploaded by {resource.uploadedBy?.name} ({resource.uploadedBy?.role})
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(resource.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {resource.verificationStatus === 'Approved' && resource.verifiedBy && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-semibold">Verified by {resource.verifiedBy.name}</span>
                {resource.verificationNote && (
                  <p className="text-[11px] text-emerald-700 italic">"{resource.verificationNote}"</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="md"
              onClick={handleDownload}
              icon={Download}
            >
              Download Material ({formatFileSize(resource.file?.size)})
            </Button>

            <Button
              variant={isBookmarked ? 'secondary' : 'outline'}
              size="md"
              onClick={handleBookmarkToggle}
              isLoading={bookmarkLoading}
              icon={Bookmark}
              className={isBookmarked ? 'text-amber-700 bg-amber-50 border-amber-200' : ''}
            >
              {isBookmarked ? 'Bookmarked' : 'Save to Bookmarks'}
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setReportModalOpen(true)}
              icon={AlertTriangle}
              className="text-slate-500 hover:text-rose-600"
            >
              Report Issue
            </Button>
          </div>

          {/* Verification & Modification Controls */}
          <div className="flex items-center gap-2">
            {canVerify && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVerifyModalOpen(true)}
                icon={ShieldCheck}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                Verification Control
              </Button>
            )}

            {canEditOrDelete && (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  title="Edit resource metadata"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  title="Delete resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Document Preview Section */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Document In-Browser Preview</span>
        </h3>

        <PDFViewer
          previewUrl={resourcesApi.getPreviewUrl(resource._id)}
          downloadUrl={resourcesApi.getDownloadUrl(resource._id)}
          fileName={resource.file?.originalName}
          fileType={resource.file?.mimeType}
        />
      </section>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Problematic Resource"
        subtitle="Help keep CampusNotes accurate, safe, and syllabus-aligned."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <Select
            label="Reason for Report"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            options={[
              'Duplicate',
              'Wrong or Irrelevant Material',
              'Incorrect Content',
              'Inappropriate Content',
              'Corrupted File',
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={4}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Explain why this material needs moderation or review..."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={reportSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verification Modal for Faculty/Admin */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Faculty Verification Control"
        subtitle="Approve or reject this material according to department syllabus."
      >
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <Select
            label="Verification Decision"
            value={verifyStatus}
            onChange={(e) => setVerifyStatus(e.target.value)}
            options={[
              { value: 'Approved', label: 'Approve & Grant "Faculty Verified" Badge' },
              { value: 'Rejected', label: 'Reject Material' },
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Verification Note (Optional)
            </label>
            <textarea
              rows={3}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              placeholder="e.g. Verified with university curriculum 2024-2025."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={verifySubmitting}>
              Save Verification Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Metadata Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Resource Information"
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
            placeholder="e.g. OS, Process Management, Notes"
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

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteResource}
        isLoading={deleteLoading}
        title="Delete Resource"
        message="Are you sure you want to permanently delete this resource? Physical files and saved bookmarks will be removed."
        confirmText="Delete Permanently"
      />
    </div>
  );
};
