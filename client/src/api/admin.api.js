import { api } from './axios';

export const adminApi = {
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  getUserById: async (id) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },

  getAllResources: async (params = {}) => {
    const res = await api.get('/admin/resources', { params });
    return res.data;
  },

  removeResource: async (id) => {
    const res = await api.delete(`/admin/resources/${id}`);
    return res.data;
  },
};
