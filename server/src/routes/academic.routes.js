import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getUnitsBySubject,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
} from '../controllers/academic.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validate } from '../middleware/validate.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createUnitSchema,
  updateUnitSchema,
} from '../validators/academic.validator.js';

const router = Router();

// Departments
router.get('/departments', optionalAuthenticate, getDepartments);
router.get('/departments/:id', optionalAuthenticate, getDepartmentById);
router.post(
  '/departments',
  authenticate,
  authorizeRoles('Admin'),
  validate(createDepartmentSchema),
  createDepartment
);
router.patch(
  '/departments/:id',
  authenticate,
  authorizeRoles('Admin'),
  validate(updateDepartmentSchema),
  updateDepartment
);
router.delete('/departments/:id', authenticate, authorizeRoles('Admin'), deleteDepartment);

// Subjects
router.get('/subjects', optionalAuthenticate, getSubjects);
router.get('/subjects/:id', optionalAuthenticate, getSubjectById);
router.post(
  '/subjects',
  authenticate,
  authorizeRoles('Admin'),
  validate(createSubjectSchema),
  createSubject
);
router.patch(
  '/subjects/:id',
  authenticate,
  authorizeRoles('Admin'),
  validate(updateSubjectSchema),
  updateSubject
);
router.delete('/subjects/:id', authenticate, authorizeRoles('Admin'), deleteSubject);

// Units
router.get('/subjects/:subjectId/units', optionalAuthenticate, getUnitsBySubject);
router.post(
  '/subjects/:subjectId/units',
  authenticate,
  authorizeRoles('Admin'),
  validate(createUnitSchema),
  createUnit
);
router.get('/units/:id', optionalAuthenticate, getUnitById);
router.patch(
  '/units/:id',
  authenticate,
  authorizeRoles('Admin'),
  validate(updateUnitSchema),
  updateUnit
);
router.delete('/units/:id', authenticate, authorizeRoles('Admin'), deleteUnit);

export default router;
