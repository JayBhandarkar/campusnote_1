import { AcademicService } from '../services/academic.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --- Departments ---
export const getDepartments = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' && req.user && req.user.role === 'Admin';
  const departments = await AcademicService.getAllDepartments(includeInactive);
  return apiResponse(res, 200, 'Departments retrieved', { departments });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await AcademicService.getDepartmentById(req.params.id);
  return apiResponse(res, 200, 'Department retrieved', { department });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await AcademicService.createDepartment(req.body);
  return apiResponse(res, 201, 'Department created successfully', { department });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await AcademicService.updateDepartment(req.params.id, req.body);
  return apiResponse(res, 200, 'Department updated successfully', { department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await AcademicService.deleteDepartment(req.params.id);
  return apiResponse(res, 200, 'Department deleted successfully');
});

// --- Subjects ---
export const getSubjects = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true' && req.user && req.user.role === 'Admin';
  const filter = {
    department: req.query.department,
    semester: req.query.semester,
    includeInactive,
  };
  const subjects = await AcademicService.getSubjects(filter);
  return apiResponse(res, 200, 'Subjects retrieved', { subjects });
});

export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await AcademicService.getSubjectById(req.params.id);
  return apiResponse(res, 200, 'Subject retrieved', { subject });
});

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await AcademicService.createSubject(req.body);
  return apiResponse(res, 201, 'Subject created successfully', { subject });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await AcademicService.updateSubject(req.params.id, req.body);
  return apiResponse(res, 200, 'Subject updated successfully', { subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  await AcademicService.deleteSubject(req.params.id);
  return apiResponse(res, 200, 'Subject deleted successfully');
});

// --- Units ---
export const getUnitsBySubject = asyncHandler(async (req, res) => {
  const units = await AcademicService.getUnitsBySubject(req.params.subjectId);
  return apiResponse(res, 200, 'Units retrieved', { units });
});

export const getUnitById = asyncHandler(async (req, res) => {
  const unit = await AcademicService.getUnitById(req.params.id);
  return apiResponse(res, 200, 'Unit retrieved', { unit });
});

export const createUnit = asyncHandler(async (req, res) => {
  const unitData = {
    ...req.body,
    subject: req.params.subjectId || req.body.subject,
  };
  const unit = await AcademicService.createUnit(unitData);
  return apiResponse(res, 201, 'Unit created successfully', { unit });
});

export const updateUnit = asyncHandler(async (req, res) => {
  const unit = await AcademicService.updateUnit(req.params.id, req.body);
  return apiResponse(res, 200, 'Unit updated successfully', { unit });
});

export const deleteUnit = asyncHandler(async (req, res) => {
  await AcademicService.deleteUnit(req.params.id);
  return apiResponse(res, 200, 'Unit deleted successfully');
});
