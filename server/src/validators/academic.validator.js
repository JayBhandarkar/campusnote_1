import { z } from 'zod';

export const createDepartmentSchema = {
  body: z.object({
    name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
    code: z.string().min(2, 'Department code must be at least 2 characters').max(10).toUpperCase().trim(),
    description: z.string().max(500).optional().default(''),
    isActive: z.boolean().optional().default(true),
  }),
};

export const updateDepartmentSchema = {
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(10).toUpperCase().trim().optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const createSubjectSchema = {
  body: z.object({
    name: z.string().min(2, 'Subject name must be at least 2 characters').max(120),
    code: z.string().min(2, 'Subject code must be at least 2 characters').max(15).toUpperCase().trim(),
    department: z.string().min(1, 'Department ID is required'),
    semester: z.coerce.number().min(1, 'Semester must be between 1 and 8').max(8),
    description: z.string().max(500).optional().default(''),
    isActive: z.boolean().optional().default(true),
  }),
};

export const updateSubjectSchema = {
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    code: z.string().min(2).max(15).toUpperCase().trim().optional(),
    department: z.string().optional(),
    semester: z.coerce.number().min(1).max(8).optional(),
    description: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  }),
};

export const createUnitSchema = {
  body: z.object({
    title: z.string().min(2, 'Unit title must be at least 2 characters').max(150),
    unitNumber: z.coerce.number().min(1, 'Unit number must be at least 1').max(20),
    subject: z.string().min(1, 'Subject ID is required'),
    description: z.string().max(500).optional().default(''),
  }),
};

export const updateUnitSchema = {
  body: z.object({
    title: z.string().min(2).max(150).optional(),
    unitNumber: z.coerce.number().min(1).max(20).optional(),
    subject: z.string().optional(),
    description: z.string().max(500).optional(),
  }),
};
