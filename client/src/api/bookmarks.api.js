import { api } from './axios';

export const bookmarksApi = {
  addBookmark: async (resourceId) => {
    const res = await api.post(`/resources/${resourceId}/bookmark`);
    return res.data;
  },

  removeBookmark: async (resourceId) => {
    const res = await api.delete(`/resources/${resourceId}/bookmark`);
    return res.data;
  },

  getMyBookmarks: async () => {
    const res = await api.get('/users/me/bookmarks');
    return res.data;
  },
};
