import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Upload,
  Bookmark,
  FileCheck,
  FolderGit2,
  Users,
  AlertCircle,
  BookOpen,
  GraduationCap,
  X,
  FileText,
  UserCheck,
  Building2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { role, isStudent, isFaculty, isAdmin, user } = useAuth();

  // Define role-specific navigation items exactly per requirement
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Resource Management', path: '/admin/resources', icon: FolderGit2 },
        { label: 'Verification Queue', path: '/verification-queue', icon: FileCheck },
        { label: 'Report Management', path: '/admin/reports', icon: AlertCircle },
        {
          label: 'Academic Structure',
          path: '/admin/academic',
          icon: Building2,
          badge: 'Depts/Subj',
        },
        { label: 'Browse Resources', path: '/browse', icon: Search },
        { label: 'Upload Resource', path: '/upload', icon: Upload },
        { label: 'My Profile', path: '/profile', icon: GraduationCap },
      ];
    }

    if (isFaculty) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Browse Resources', path: '/browse', icon: Search },
        { label: 'Upload Resource', path: '/upload', icon: Upload },
        { label: 'My Uploads', path: '/my-uploads', icon: FileText },
        { label: 'My Bookmarks', path: '/my-bookmarks', icon: Bookmark },
        { label: 'Verification Queue', path: '/verification-queue', icon: FileCheck },
        { label: 'My Verified Resources', path: '/my-verified', icon: UserCheck },
        { label: 'My Reports', path: '/my-reports', icon: AlertCircle },
        { label: 'My Profile', path: '/profile', icon: GraduationCap },
      ];
    }

    // Default: Student
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Browse Resources', path: '/browse', icon: Search },
      { label: 'Upload Resource', path: '/upload', icon: Upload },
      { label: 'My Uploads', path: '/my-uploads', icon: FileText },
      { label: 'My Bookmarks', path: '/my-bookmarks', icon: Bookmark },
      { label: 'My Reports', path: '/my-reports', icon: AlertCircle },
      { label: 'My Profile', path: '/profile', icon: GraduationCap },
    ];
  };

  const navLinks = getNavLinks();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <NavLink to={isAdmin ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                CampusNotes
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-indigo-500/30 text-indigo-300 rounded border border-indigo-400/20">
                  {role}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">Academic Repository</span>
            </div>
          )}
        </NavLink>

        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (isMobileOpen && onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`
              }
              title={isCollapsed && !isMobileOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {(!isCollapsed || isMobileOpen) && item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info footer */}
      {(!isCollapsed || isMobileOpen) && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
              <span className="text-[11px] text-slate-400 truncate">{user?.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with backdrop) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-slate-900 z-10 shadow-2xl animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
