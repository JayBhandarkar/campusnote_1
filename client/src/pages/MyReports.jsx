import React, { useState, useEffect } from 'react';
import { AlertCircle, Link as LinkIcon, CheckCircle2, Clock } from 'lucide-react';
import { reportsApi } from '../api/reports.api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await reportsApi.getMyReports();
        if (res.success && res.data?.reports) {
          setReports(res.data.reports);
        }
      } catch (err) {
        toast.error('Failed to load your reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Submitted Reports
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Track the moderation status and administrative resolution of reported resources.
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : reports.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report._id} className="p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                      Reason: {report.reason}
                    </span>
                    <StatusBadge status={report.status} type="reportStatus" size="sm" />
                  </div>
                  <span className="text-xs text-slate-400">
                    Reported on {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {report.resource && (
                  <div>
                    <span className="text-xs text-slate-500 block">Reported Resource:</span>
                    <Link
                      to={`/resources/${report.resource._id}`}
                      className="text-sm font-bold text-slate-800 hover:text-indigo-600 inline-flex items-center gap-1.5"
                    >
                      <span>{report.resource.title}</span>
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                    </Link>
                  </div>
                )}

                {report.details && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Your note: </span>
                    {report.details}
                  </p>
                )}

                {report.resolutionNote && (
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                    <span className="font-bold">Admin Resolution: </span>
                    {report.resolutionNote}
                    {report.reviewedBy && (
                      <span className="text-emerald-700 block mt-0.5">
                        Reviewed by: {report.reviewedBy.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No reports submitted"
          description="You haven't reported any issues with resources. Thanks for being part of CampusNotes!"
        />
      )}
    </div>
  );
};
