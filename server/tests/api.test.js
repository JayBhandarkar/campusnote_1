import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { uploadDir } from '../src/config/storage.js';

describe('CampusNotes API Integration & Security Test Suite', () => {
  let studentToken = '';
  let facultyToken = '';
  let adminToken = '';
  let studentUser = null;
  let testDepartmentId = '';
  let testSubjectId = '';
  let testUnitId = '';
  let uploadedResourceId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI);
    }

    // Login as Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@campusnotes.edu', password: 'AdminPassword@123' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // Login as Faculty
    const facultyRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'faculty@campusnotes.edu', password: 'FacultyPassword@123' });
    expect(facultyRes.status).toBe(200);
    facultyToken = facultyRes.body.data.token;
  });

  afterAll(async () => {
    // Keep connection clean
  });

  describe('1. Authentication & Role Enforcement', () => {
    const testEmail = `student_${Date.now()}@campusnotes.edu`;

    it('should register a new user as Student (regardless of client attempt to escalate)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Security Test Student',
          email: testEmail,
          password: 'TestPassword@123',
          confirmPassword: 'TestPassword@123',
          role: 'Admin', // Attempt to escalate privilege
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('Student'); // Must remain Student
      studentToken = res.body.data.token;
      studentUser = res.body.data.user;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate Student',
          email: testEmail,
          password: 'TestPassword@123',
          confirmPassword: 'TestPassword@123',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should get current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testEmail);
    });
  });

  describe('2. Authorization Boundaries', () => {
    it('should reject student from accessing admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow admin to access admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.totalUsers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Academic Structure & Hierarchy Validation', () => {
    it('should retrieve departments and find Computer Engineering', async () => {
      const res = await request(app).get('/api/v1/departments');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.departments)).toBe(true);
      const ce = res.body.data.departments.find((d) => d.code === 'CE');
      expect(ce).toBeDefined();
      testDepartmentId = ce._id;
    });

    it('should retrieve subjects for CE semester 5 and find Operating Systems', async () => {
      const res = await request(app)
        .get('/api/v1/subjects')
        .query({ department: testDepartmentId, semester: 5 });

      expect(res.status).toBe(200);
      const os = res.body.data.subjects.find((s) => s.code === 'CS501');
      expect(os).toBeDefined();
      testSubjectId = os._id;
    });

    it('should retrieve units for Operating Systems and find Unit 3', async () => {
      const res = await request(app).get(`/api/v1/subjects/${testSubjectId}/units`);
      expect(res.status).toBe(200);
      const unit3 = res.body.data.units.find((u) => u.unitNumber === 3);
      expect(unit3).toBeDefined();
      testUnitId = unit3._id;
    });
  });

  describe('4. Resource Upload & SHA-256 Duplicate Detection', () => {
    const testUploadPath = path.join(uploadDir, `test-temp-${Date.now()}.pdf`);

    beforeAll(() => {
      // Create a unique temporary PDF file
      fs.writeFileSync(testUploadPath, `%PDF-1.4 Unit Test File Content: ${Date.now()}`);
    });

    afterAll(() => {
      if (fs.existsSync(testUploadPath)) fs.unlinkSync(testUploadPath);
    });

    it('should upload a new resource with valid academic hierarchy', async () => {
      const res = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('title', 'Unit Test Resource - CPU Scheduling Guide')
        .field('description', 'Comprehensive guide for unit testing')
        .field('department', testDepartmentId)
        .field('semester', 5)
        .field('subject', testSubjectId)
        .field('unit', testUnitId)
        .field('resourceType', 'Notes')
        .field('academicYear', '2024-2025')
        .field('tags', 'cpu, scheduling, vitest')
        .attach('file', testUploadPath);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resource.title).toBe('Unit Test Resource - CPU Scheduling Guide');
      expect(res.body.data.resource.fileHash).toBeDefined();
      uploadedResourceId = res.body.data.resource._id;
    });

    it('should REJECT duplicate upload with HTTP 409 and return existingResourceId', async () => {
      const res = await request(app)
        .post('/api/v1/resources')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('title', 'Attempting Duplicate Upload')
        .field('department', testDepartmentId)
        .field('semester', 5)
        .field('subject', testSubjectId)
        .field('unit', testUnitId)
        .field('resourceType', 'Notes')
        .field('academicYear', '2024-2025')
        .attach('file', testUploadPath); // Exact same file content

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been uploaded');
      expect(res.body.data.existingResourceId).toBe(uploadedResourceId);
    });
  });

  describe('5. Faculty Verification Workflow', () => {
    it('should reject student attempt to verify resource', async () => {
      const res = await request(app)
        .patch(`/api/v1/resources/${uploadedResourceId}/verification`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'Approved', note: 'Student unauthorized verification' });

      expect(res.status).toBe(403);
    });

    it('should allow faculty to verify and approve resource', async () => {
      const res = await request(app)
        .patch(`/api/v1/resources/${uploadedResourceId}/verification`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({ status: 'Approved', note: 'Verified by Faculty member' });

      expect(res.status).toBe(200);
      expect(res.body.data.resource.verificationStatus).toBe('Approved');
      expect(res.body.data.resource.verificationNote).toBe('Verified by Faculty member');
    });
  });

  describe('6. Bookmarks & Reporting', () => {
    it('should allow user to bookmark resource', async () => {
      const res = await request(app)
        .post(`/api/v1/resources/${uploadedResourceId}/bookmark`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should list bookmarked resource in my bookmarks', async () => {
      const res = await request(app)
        .get('/api/v1/users/me/bookmarks')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      const found = res.body.data.items.find((item) => item._id === uploadedResourceId);
      expect(found).toBeDefined();
      expect(found.isBookmarked).toBe(true);
    });

    it('should allow user to submit a report on resource', async () => {
      const res = await request(app)
        .post(`/api/v1/resources/${uploadedResourceId}/reports`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          reason: 'Wrong or Irrelevant Material',
          details: 'Reporting for test verification purposes',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.report.status).toBe('Pending');
    });

    it('should remove bookmark successfully', async () => {
      const res = await request(app)
        .delete(`/api/v1/resources/${uploadedResourceId}/bookmark`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('7. File Preview & Download Stream', () => {
    it('should support previewing uploaded PDF', async () => {
      const res = await request(app).get(`/api/v1/resources/${uploadedResourceId}/preview`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('pdf');
      expect(res.headers['content-disposition']).toContain('inline');
    });

    it('should support downloading file and increment download count', async () => {
      const res = await request(app).get(`/api/v1/resources/${uploadedResourceId}/download`);
      expect(res.status).toBe(200);
      expect(res.headers['content-disposition']).toContain('attachment');

      // Verify download count incremented
      const details = await request(app).get(`/api/v1/resources/${uploadedResourceId}`);
      expect(details.body.data.resource.downloadCount).toBeGreaterThanOrEqual(1);
    });
  });
});
