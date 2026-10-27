import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCcw,
  BookOpen,
  Layers,
  GraduationCap,
  Calendar,
  FileCheck,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { resourcesApi } from '../api/resources.api';
import { academicApi } from '../api/academic.api';
import { ResourceCard } from '../components/ui/ResourceCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';

export const BrowseResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL or defaults
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [semester, setSemester] = useState(searchParams.get('semester') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [unit, setUnit] = useState(searchParams.get('unit') || '');
  const [resourceType, setResourceType] = useState(searchParams.get('type') || '');
  const [academicYear, setAcademicYear] = useState(searchParams.get('academicYear') || '');
  const [verificationStatus, setVerificationStatus] = useState(
    searchParams.get('verificationStatus') || 'all'
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Dependent academic options
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  // Data state
  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // 1. Load departments on initial mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await academicApi.getDepartments();
        if (res.success && res.data?.departments) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  // 2. Dependent Dropdown: When department or semester changes, fetch valid subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!department) {
        setSubjects([]);
        setSubject('');
        setUnits([]);
        setUnit('');
        return;
      }
      try {
        const params = { department };
        if (semester) params.semester = semester;
        const res = await academicApi.getSubjects(params);
        if (res.success && res.data?.subjects) {
          setSubjects(res.data.subjects);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, [department, semester]);

  // 3. Dependent Dropdown: When subject changes, fetch valid units
  useEffect(() => {
    const fetchUnits = async () => {
      if (!subject) {
        setUnits([]);
        setUnit('');
        return;
      }
      try {
        const res = await academicApi.getUnitsBySubject(subject);
        if (res.success && res.data?.units) {
          setUnits(res.data.units);
        }
      } catch (err) {
        console.error('Failed to load units:', err);
      }
    };
    fetchUnits();
  }, [subject]);

  // 4. Fetch resources matching active filters
  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
      };

      if (search.trim()) params.q = search.trim();
      if (department) params.department = department;
      if (semester) params.semester = semester;
      if (subject) params.subject = subject;
      if (unit) params.unit = unit;
      if (resourceType) params.type = resourceType;
      if (academicYear) params.academicYear = academicYear;
      if (verificationStatus && verificationStatus !== 'all') {
        params.verificationStatus = verificationStatus;
      }

      // Update URL search parameters
      const urlParams = {};
      Object.keys(params).forEach((key) => {
        if (params[key]) urlParams[key] = params[key].toString();
      });
      setSearchParams(urlParams, { replace: true });

      const res = await resourcesApi.getResources(params);
      if (res.success && res.data?.items) {
        setResources(res.data.items);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to query resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & filter re-fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, semester, subject, unit, resourceType, academicYear, verificationStatus, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setSemester('');
    setSubject('');
    setUnit('');
    setResourceType('');
    setAcademicYear('');
    setVerificationStatus('all');
    setSort('latest');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by keywords, notes title, syllabus topics..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="latest">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
            title="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            icon={RotateCcw}
            className="text-slate-500 hover:text-slate-800"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filter Panel (Desktop Left Sidebar / Collapsible Mobile) */}
        <div
          className={`lg:block bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setSubject('');
                setUnit('');
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setSubject('');
                setUnit('');
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Dependent Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setUnit('');
                setPage(1);
              }}
              disabled={!department && subjects.length === 0}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {department ? 'All Subjects in Dept' : 'Select Department First'}
              </option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dependent Unit */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                setPage(1);
              }}
              disabled={!subject}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{subject ? 'All Units' : 'Select Subject First'}</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  Unit {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {[
                'Notes',
                'PPT',
                'Assignment',
                'Lab Manual',
                'Question Bank',
                'Previous Year Paper',
                'Important Questions',
              ].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => {
                setAcademicYear(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Years</option>
              {['2025-2026', '2024-2025', '2023-2024', '2022-2023'].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Verification Badge
            </label>
            <select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Materials</option>
              <option value="Approved">Faculty Verified Only</option>
              <option value="Pending">Pending Review</option>
            </select>
          </div>
        </div>

        {/* Resources Grid (Desktop Right 3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : resources.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {resources.map((res) => (
                  <ResourceCard key={res._id} resource={res} />
                ))}
              </div>

              {/* Server-side Pagination */}
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                totalCount={meta.totalCount}
                limit={meta.limit}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </>
          ) : (
            <EmptyState
              title="No materials match your filters"
              description="Try broadening your search query or clearing active department or semester filters."
              actionLabel="Clear Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
