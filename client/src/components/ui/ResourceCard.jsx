import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  Calendar,
  Layers,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { bookmarksApi } from '../../api/bookmarks.api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const ResourceCard = ({ resource, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to bookmark resources');
      return;
    }

    try {
      setBookmarkLoading(true);
      if (isBookmarked) {
        await bookmarksApi.removeBookmark(resource._id);
        setIsBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await bookmarksApi.addBookmark(resource._id);
        setIsBookmarked(true);
        toast.success('Resource saved to bookmarks');
      }
      if (onBookmarkChange) onBookmarkChange(resource._id, !isBookmarked);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExt = (name) => {
    if (!name) return 'FILE';
    const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
    return ext;
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {resource.resourceType || 'Notes'}
            </span>
            {resource.verificationStatus === 'Approved' && (
              <StatusBadge status="Approved" type="verification" size="sm" />
            )}
          </div>
          <button
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Save bookmark'}
            aria-label="Bookmark resource"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <Link to={`/resources/${resource._id}`} className="block group-hover:text-indigo-600 transition-colors">
          <h4 className="font-semibold text-slate-900 text-base line-clamp-2 leading-snug mb-2">
            {resource.title}
          </h4>
        </Link>

        {/* Academic Hierarchy */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate">
              {resource.subject?.name} ({resource.subject?.code})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 truncate">
            <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Unit {resource.unit?.unitNumber}: {resource.unit?.title}
            </span>
          </div>
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {resource.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[11px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
            {getFileExt(resource.file?.originalName)}
          </span>
          <span>{formatFileSize(resource.file?.size)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-600" title="Total downloads">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{resource.downloadCount || 0}</span>
          </div>
          <Link
            to={`/resources/${resource._id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
