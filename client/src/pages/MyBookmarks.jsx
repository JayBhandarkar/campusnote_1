import React, { useState, useEffect } from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import { bookmarksApi } from '../api/bookmarks.api';
import { ResourceCard } from '../components/ui/ResourceCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await bookmarksApi.getMyBookmarks();
      if (res.success && res.data?.items) {
        setBookmarks(res.data.items);
      }
    } catch (err) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleBookmarkChange = (resourceId, isBookmarked) => {
    if (!isBookmarked) {
      setBookmarks((prev) => prev.filter((item) => item._id !== resourceId));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Saved Bookmarks
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quickly access your saved study materials, formula sheets, and verified exam resources.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarks.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onBookmarkChange={handleBookmarkChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No bookmarks saved yet"
          description="Click the bookmark icon on any study material card to save it here for fast revision."
          actionLabel="Explore Materials"
          onAction={() => (window.location.href = '/browse')}
        />
      )}
    </div>
  );
};
