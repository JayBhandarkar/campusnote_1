import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  BookOpen,
  Layers,
  Filter,
} from 'lucide-react';
import { resourcesApi } from '../api/resources.api';
import { academicApi } from '../api/academic.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { PDFViewer } from '../components/ui/PDFViewer';
import toast from 'react-hot-toast';

export const VerificationQueue = () => {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [activeItem, setActiveItem] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [decision, setDecision] = useState('Approved');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDept) params.department = selectedDept;
      const res = await resourcesApi.getVerificationQueue(params);
      if (res.success && res.data?.items) {
        setItems(res.data.items);
      }
    } catch (err) {
      toast.error('Failed to load verification queue');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchQueue();
  }, [selectedDept]);

  const openVerifyModal = (item) => {
    setActiveItem(item);
    setDecision('Approved');
    setNote('');
    setVerifyModalOpen(true);
  };

  const openPreviewModal = (item) => {
    setActiveItem(item);
    setPreviewModalOpen(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!activeItem) return;

    try {
      setSubmitting(true);
      await resourcesApi.verifyResource(activeItem._id, {
        status: decision,
        note,
      });
      toast.success(`Resource successfully ${decision.toLowerCase()}`);
      setVerifyModalOpen(false);
      setActiveItem(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Verification Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted student notes, verify syllabus accuracy, and grant the "Faculty Verified" badge.
          </p>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {items.map((res) => (
              <div
                key={res._id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {res.resourceType}
                    </span>
                    <span className="text-xs text-slate-500">
                      {res.department?.code} • Sem {res.semester}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Uploaded by {res.uploadedBy?.name}
                    </span>
                  </div>

                  <Link
                    to={`/resources/${res._id}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 text-base block truncate"
                  >
                    {res.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700">
                      {res.subject?.name} ({res.subject?.code})
                    </span>
                    <span>•</span>
                    <span>
                      Unit {res.unit?.unitNumber}: {res.unit?.title}
                    </span>
                    <span>•</span>
                    <span>{res.file?.originalName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={() => openPreviewModal(res)}
                  >
                    Quick Preview
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => openVerifyModal(res)}
                  >
                    Review & Decide
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="Verification Queue is Clear!"
          description="There are currently no resources awaiting verification. Excellent work keeping materials up to date!"
        />
      )}

      {/* Decision Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Faculty Verification Decision"
        subtitle={activeItem?.title}
      >
        <form onSubmit={handleVerifySubmit} className="space-y-4">
          <Select
            label="Verification Action"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            options={[
              { value: 'Approved', label: 'Approve & Issue "Faculty Verified" Stamp' },
              { value: 'Rejected', label: 'Reject / Request Changes' },
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Faculty Note (Optional)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Verified with university curriculum 2024-2025. Well-structured notes."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={`Preview: ${activeItem?.title || ''}`}
        maxWidth="max-w-4xl"
      >
        {activeItem && (
          <div className="space-y-4">
            <PDFViewer
              previewUrl={resourcesApi.getPreviewUrl(activeItem._id)}
              downloadUrl={resourcesApi.getDownloadUrl(activeItem._id)}
              fileName={activeItem.file?.originalName}
              fileType={activeItem.file?.mimeType}
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setPreviewModalOpen(false);
                  openVerifyModal(activeItem);
                }}
              >
                Proceed to Review Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
