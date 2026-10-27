import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Clock,
  Filter,
} from 'lucide-react';
import { reportsApi } from '../api/reports.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Pagination } from '../components/ui/Pagination';
import toast from 'react-hot-toast';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Review Modal
  const [activeReport, setActiveReport] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [removeResource, setRemoveResource] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (reasonFilter !== 'all') params.reason = reasonFilter;

      const res = await reportsApi.getAllReports(params);
      if (res.success && res.data?.items) {
        setReports(res.data.items);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, reasonFilter, page]);

  const openReviewModal = (report) => {
    setActiveReport(report);
    setNewStatus(report.status === 'Pending' ? 'Resolved' : report.status);
    setResolutionNote(report.resolutionNote || '');
    setRemoveResource(false);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      setSubmitting(true);
      await reportsApi.updateReportStatus(activeReport._id, {
        status: newStatus,
        resolutionNote,
        removeResource,
      });
      toast.success(`Report updated to ${newStatus}`);
      setReviewModalOpen(false);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Report Management
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review community reports regarding duplicate, irrelevant, or inappropriate study materials.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Filter Reports:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Reasons</option>
            <option value="Duplicate">Duplicate</option>
            <option value="Wrong or Irrelevant Material">Wrong or Irrelevant</option>
            <option value="Incorrect Content">Incorrect Content</option>
            <option value="Inappropriate Content">Inappropriate Content</option>
            <option value="Corrupted File">Corrupted File</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      {report.resource ? (
                        <Link
                          to={`/resources/${report.resource._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 block truncate max-w-xs"
                        >
                          {report.resource.title}
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">Deleted / Removed</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        {report.reason}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{report.reportedBy?.name}</div>
                      <div className="text-[10px] text-slate-400">{report.reportedBy?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={report.status} type="reportStatus" size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openReviewModal(report)}
                      >
                        Review Report
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No reports found matching criteria.
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

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review & Resolve Community Report"
        subtitle={activeReport?.resource?.title}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-700">Report Reason: </span>
              <span className="text-rose-700 font-semibold">{activeReport?.reason}</span>
            </div>
            {activeReport?.details && (
              <div>
                <span className="font-bold text-slate-700">Reporter's Comments: </span>
                <p className="text-slate-600 mt-0.5">{activeReport.details}</p>
              </div>
            )}
            {activeReport?.resource && (
              <div className="pt-2 border-t border-slate-200">
                <Link
                  to={`/resources/${activeReport.resource._id}`}
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                >
                  <span>Open Resource in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <Select
            label="Resolution Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'Under Review', label: 'Mark as Under Review' },
              { value: 'Resolved', label: 'Resolve Report' },
              { value: 'Rejected', label: 'Reject Report (Dismiss)' },
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resolution Note (Visible to reporter)
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Verified syllabus relevance. Issue has been addressed."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          {activeReport?.resource && (
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-900 font-semibold">
                <input
                  type="checkbox"
                  checked={removeResource}
                  onChange={(e) => setRemoveResource(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
                />
                <span>Also remove/moderate this resource from CampusNotes</span>
              </label>
              <p className="text-[11px] text-rose-700 mt-1 pl-6">
                If checked, the resource status will be set to 'Removed' and physical storage will be deleted immediately.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
