import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './RoleGuard';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';

// Authenticated Pages
import { Dashboard } from '../pages/Dashboard';
import { BrowseResources } from '../pages/BrowseResources';
import { ResourceDetails } from '../pages/ResourceDetails';
import { UploadResource } from '../pages/UploadResource';
import { MyUploads } from '../pages/MyUploads';
import { MyBookmarks } from '../pages/MyBookmarks';
import { MyReports } from '../pages/MyReports';
import { FacultyVerifiedList } from '../pages/FacultyVerifiedList';
import { VerificationQueue } from '../pages/VerificationQueue';
import { Profile } from '../pages/Profile';
import { NotFound } from '../pages/NotFound';

// Admin Pages
import { AdminDashboard } from '../pages/AdminDashboard';
import { AdminUsers } from '../pages/AdminUsers';
import { AdminResources } from '../pages/AdminResources';
import { AdminReports } from '../pages/AdminReports';
import { AdminAcademic } from '../pages/AdminAcademic';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Authenticated Application Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Universal for Student, Faculty, Admin */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/browse" element={<BrowseResources />} />
        <Route path="/resources/:id" element={<ResourceDetails />} />
        <Route path="/upload" element={<UploadResource />} />
        <Route path="/my-uploads" element={<MyUploads />} />
        <Route path="/my-bookmarks" element={<MyBookmarks />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/profile" element={<Profile />} />

        {/* Faculty & Admin Routes */}
        <Route
          path="/verification-queue"
          element={
            <RoleGuard allowedRoles={['Faculty', 'Admin']}>
              <VerificationQueue />
            </RoleGuard>
          }
        />
        <Route
          path="/my-verified"
          element={
            <RoleGuard allowedRoles={['Faculty', 'Admin']}>
              <FacultyVerifiedList />
            </RoleGuard>
          }
        />

        {/* Admin Only Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminUsers />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminResources />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminReports />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/academic"
          element={
            <RoleGuard allowedRoles={['Admin']}>
              <AdminAcademic />
            </RoleGuard>
          }
        />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
