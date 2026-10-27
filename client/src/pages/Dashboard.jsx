import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  BookOpen,
  Bookmark,
  FileCheck2,
  FileText,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resourcesApi } from '../api/resources.api';
import { bookmarksApi } from '../api/bookmarks.api';
import { ResourceCard } from '../components/ui/ResourceCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Button } from '../components/ui/Button';

export const Dashboard = () => {
  const { user, role, isFaculty, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentResources, setRecentResources] = useState([]);
  const [verifiedResources, setVerifiedResources] = useState([]);
  const [myUploadsCount, setMyUploadsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch recent resources
        const recentRes = await resourcesApi.getResources({ limit: 4, sort: 'latest' });
        if (recentRes.success) {
          setRecentResources(recentRes.data.items || []);
        }

        // Fetch verified resources
        const verifiedRes = await resourcesApi.getResources({
          verificationStatus: 'Approved',
          limit: 4,
          sort: 'downloads',
        });
        if (verifiedRes.success) {
          setVerifiedResources(verifiedRes.data.items || []);
        }

        // Fetch user stats
        const bookmarksRes = await bookmarksApi.getMyBookmarks();
        if (bookmarksRes.success) {
          setBookmarksCount(bookmarksRes.data.items?.length || 0);
        }

        // Fetch my uploads
        const uploadsRes = await resourcesApi.getResources({ limit: 100 });
        if (uploadsRes.success && user) {
          const myCount = uploadsRes.data.items.filter(
            (r) => r.uploadedBy?._id === user._id || r.uploadedBy === user._id
          ).length;
          setMyUploadsCount(myCount);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const resourceTypes = [
    'Notes',
    'Previous Year Paper',
    'Question Bank',
    'PPT',
    'Assignment',
    'Lab Manual',
    'Important Questions',
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>Academic Portal • {role} Edition</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-indigo-100 font-normal leading-relaxed mb-6">
            {user?.department?.name
              ? `${user.department.name} ${user.semester ? `• Semester ${user.semester}` : ''}`
              : 'Find syllabus-verified study notes, question papers, and lab manuals organized by unit.'}
          </p>

          {/* Quick Search inside banner */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 max-w-lg bg-white rounded-xl p-1.5 shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400 ml-2.5 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects, units, or topics (e.g. CS501, OS)..."
              className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none py-1.5"
            />
            <Button type="submit" size="sm" variant="primary">
              Search
            </Button>
          </form>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Quick Action Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/browse"
          className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Browse Hub</span>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              All Materials
            </h4>
          </div>
        </Link>

        <Link
          to="/upload"
          className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Upload Notes</span>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
              Share Resource
            </h4>
          </div>
        </Link>

        <Link
          to="/my-bookmarks"
          className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Saved Items</span>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              {bookmarksCount} Bookmarks
            </h4>
          </div>
        </Link>

        <Link
          to={isFaculty || isAdmin ? '/verification-queue' : '/my-uploads'}
          className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-purple-300 transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            {isFaculty || isAdmin ? <FileCheck2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">
              {isFaculty || isAdmin ? 'Faculty Queue' : 'My Contributions'}
            </span>
            <h4 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
              {isFaculty || isAdmin ? 'Review Queue' : `${myUploadsCount} Uploads`}
            </h4>
          </div>
        </Link>
      </div>

      {/* Resource Type Quick Filters */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Explore by Material Type
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {resourceTypes.map((type) => (
            <button
              key={type}
              onClick={() => navigate(`/browse?type=${encodeURIComponent(type)}`)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all whitespace-nowrap shadow-2xs"
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Verified Notes Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Faculty-Verified Materials</h3>
          </div>
          <Link
            to="/browse?verificationStatus=Approved"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : verifiedResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {verifiedResources.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No faculty-verified materials available yet. Uploaded notes will appear here once approved by faculty.
          </div>
        )}
      </section>

      {/* Recently Uploaded Resources Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Recently Added Materials</h3>
          </div>
          <Link
            to="/browse?sort=latest"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recentResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentResources.map((res) => (
              <ResourceCard key={res._id} resource={res} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No study materials uploaded yet. Be the first to contribute by clicking Upload Resource!
          </div>
        )}
      </section>
    </div>
  );
};
