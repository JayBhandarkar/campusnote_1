import { api } from './axios';

export const reportsApi = {
  createReport: async (resourceId, data) => {
    const res = await api.post(`/resources/${resourceId}/reports`, data);
    return res.data;
  },

  getMyReports: async () => {
    const res = await api.get('/reports/my');
    return res.data;
  },

  getAllReports: async (params = {}) => {
    const res = await api.get('/admin/reports', { params });
    return res.data;
  },

  updateReportStatus: async (reportId, data) => {
    const res = await api.patch(`/admin/reports/${reportId}`, data);
    return res.data;
  },
};
