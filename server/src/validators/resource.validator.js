import { z } from 'zod';
import { RESOURCE_TYPES } from '../models/Resource.js';

export const createResourceSchema = {
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(1000).optional().default(''),
    department: z.string().min(1, 'Department is required'),
    semester: z.coerce.number().min(1).max(8),
    subject: z.string().min(1, 'Subject is required'),
    unit: z.string().min(1, 'Unit is required'),
    resourceType: z.enum(RESOURCE_TYPES, {
      errorMap: () => ({ message: `Resource type must be one of: ${RESOURCE_TYPES.join(', ')}` }),
    }),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Academic year must be formatted as YYYY-YYYY (e.g. 2024-2025)'),
    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val.map((t) => t.trim()).filter(Boolean);
        return val.split(',').map((t) => t.trim()).filter(Boolean);
      }),
  }),
};

export const updateResourceSchema = {
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(1000).optional(),
    department: z.string().optional(),
    semester: z.coerce.number().min(1).max(8).optional(),
    subject: z.string().optional(),
    unit: z.string().optional(),
    resourceType: z.enum(RESOURCE_TYPES).optional(),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/).optional(),
    tags: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (Array.isArray(val)) return val.map((t) => t.trim()).filter(Boolean);
        return val.split(',').map((t) => t.trim()).filter(Boolean);
      }),
  }),
};

export const verifyResourceSchema = {
  body: z.object({
    status: z.enum(['Approved', 'Rejected'], {
      errorMap: () => ({ message: "Status must be either 'Approved' or 'Rejected'" }),
    }),
    note: z.string().max(500).optional().default(''),
  }),
};

export const queryResourceSchema = {
  query: z.object({
    q: z.string().optional(),
    department: z.string().optional(),
    semester: z.coerce.number().min(1).max(8).optional(),
    subject: z.string().optional(),
    unit: z.string().optional(),
    type: z.string().optional(),
    academicYear: z.string().optional(),
    verificationStatus: z.enum(['Pending', 'Approved', 'Rejected', 'all']).optional(),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(12),
    sort: z.enum(['latest', 'oldest', 'downloads', 'title']).optional().default('latest'),
  }),
};
