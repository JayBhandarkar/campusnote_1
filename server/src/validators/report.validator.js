import { z } from 'zod';
import { REPORT_REASONS, REPORT_STATUSES } from '../models/Report.js';

export const createReportSchema = {
  body: z.object({
    reason: z.enum(REPORT_REASONS, {
      errorMap: () => ({ message: `Reason must be one of: ${REPORT_REASONS.join(', ')}` }),
    }),
    details: z.string().max(1000).optional().default(''),
  }),
};

export const updateReportSchema = {
  body: z.object({
    status: z.enum(REPORT_STATUSES, {
      errorMap: () => ({ message: `Status must be one of: ${REPORT_STATUSES.join(', ')}` }),
    }),
    resolutionNote: z.string().max(1000).optional().default(''),
    removeResource: z.boolean().optional().default(false),
  }),
};
