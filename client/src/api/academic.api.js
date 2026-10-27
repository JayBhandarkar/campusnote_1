import { api } from './axios';

export const academicApi = {
  // Departments
  getDepartments: async (includeInactive = false) => {
    const res = await api.get('/departments', { params: { includeInactive } });
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/departments', data);
    return res.data;
  },
  updateDepartment: async (id, data) => {
    const res = await api.patch(`/departments/${id}`, data);
    return res.data;
  },
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },

  // Subjects
  getSubjects: async (params = {}) => {
    const res = await api.get('/subjects', { params });
    return res.data;
  },
  createSubject: async (data) => {
    const res = await api.post('/subjects', data);
    return res.data;
  },
  updateSubject: async (id, data) => {
    const res = await api.patch(`/subjects/${id}`, data);
    return res.data;
  },
  deleteSubject: async (id) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },

  // Units
  getUnitsBySubject: async (subjectId) => {
    const res = await api.get(`/subjects/${subjectId}/units`);
    return res.data;
  },
  createUnit: async (subjectId, data) => {
    const res = await api.post(`/subjects/${subjectId}/units`, data);
    return res.data;
  },
  updateUnit: async (id, data) => {
    const res = await api.patch(`/units/${id}`, data);
    return res.data;
  },
  deleteUnit: async (id) => {
    const res = await api.delete(`/units/${id}`);
    return res.data;
  },
};
