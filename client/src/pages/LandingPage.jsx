import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ShieldCheck,
  FileCheck2,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/browse?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Centralized Study Material Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Study Materials, Organized. <br />
            <span className="text-indigo-600">Verified by Faculty.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            No more scattered WhatsApp groups, dead Google Drive links, or lost documents. CampusNotes brings a single organized hierarchy from Department to Unit.
          </p>

          {/* Quick Search Box */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-white rounded-2xl border border-slate-300 shadow-md mb-8"
          >
            <div className="flex items-center gap-2 flex-1 w-full pl-3">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by topic, subject code (e.g. CS501, Operating Systems)..."
                className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full sm:w-auto px-6 py-2.5">
              Explore Materials
            </Button>
          </form>

          {/* Quick Action Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Department → Semester → Unit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> SHA-256 Duplicate Check
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> PDF In-Browser Preview
            </span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Engineered for Academic Excellence
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Everything students and teachers need to preserve, search, verify, and access educational content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Structured Academic Hierarchy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Materials are indexed systematically: Department → Semester → Subject → Unit → Resource. No more guessing which unit a note belongs to.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Faculty Verification Queue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teachers review uploads before granting the verified stamp. Look for the "Faculty Verified" badge to know study materials follow the syllabus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">SHA-256 Duplicate Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identical files are detected at upload time using cryptographic SHA-256 checksums, redirecting users directly to the original upload.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Helper Box */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Instant Evaluation Credentials</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Explore all three roles in seconds</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Use the pre-seeded credentials for Student, Faculty, or Admin on the login page to test workflows without manual setup.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link to="/login">
              <Button variant="primary" icon={ArrowRight}>
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
