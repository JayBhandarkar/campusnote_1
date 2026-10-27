import { api } from './axios';

export const resourcesApi = {
  getResources: async (params = {}) => {
    const res = await api.get('/resources', { params });
    return res.data;
  },

  getResourceById: async (id) => {
    const res = await api.get(`/resources/${id}`);
    return res.data;
  },

  uploadResource: async (formData) => {
    const res = await api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateResource: async (id, data) => {
    const res = await api.patch(`/resources/${id}`, data);
    return res.data;
  },

  deleteResource: async (id) => {
    const res = await api.delete(`/resources/${id}`);
    return res.data;
  },

  verifyResource: async (id, payload) => {
    const res = await api.patch(`/resources/${id}/verification`, payload);
    return res.data;
  },

  getVerificationQueue: async (params = {}) => {
    const res = await api.get('/resources/queue', { params });
    return res.data;
  },

  getPreviewUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return `${baseURL}/resources/${id}/preview`;
  },

  getDownloadUrl: (id) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return `${baseURL}/resources/${id}/download`;
  },
};
