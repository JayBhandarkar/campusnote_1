import { ReportService } from '../services/report.service.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createReport = asyncHandler(async (req, res) => {
  const report = await ReportService.createReport(req.params.id, req.body, req.user);
  return apiResponse(res, 201, 'Report submitted successfully. Thank you for helping keep materials accurate.', {
    report,
  });
});

export const getMyReports = asyncHandler(async (req, res) => {
  const reports = await ReportService.getUserReports(req.user._id);
  return apiResponse(res, 200, 'User reports retrieved', { reports });
});

export const getAllReports = asyncHandler(async (req, res) => {
  const { items, meta } = await ReportService.getAllReports(req.query);
  return apiResponse(res, 200, 'All reports retrieved', { items }, meta);
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const report = await ReportService.updateReportStatus(req.params.id, req.body, req.user);
  return apiResponse(res, 200, `Report marked as ${req.body.status}`, { report });
});
