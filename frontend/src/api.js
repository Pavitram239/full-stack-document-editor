import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const activeUser = localStorage.getItem('doc_app_user') || 'alice';
  config.headers['X-User-Username'] = activeUser;
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getUsers = () => api.get('/users/');
export const getDocuments = (filter = 'all', search = '') => 
  api.get(`/documents/?filter=${filter}&search=${encodeURIComponent(search)}`);
export const getDocument = (id) => api.get(`/documents/${id}/`);
export const createDocument = (data) => api.post('/documents/', data);
export const updateDocument = (id, data) => api.patch(`/documents/${id}/`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}/`);
export const shareDocument = (id, data) => api.post(`/documents/${id}/share/`, data);
export const removeShare = (id, targetUserId) => api.delete(`/documents/${id}/share/?shared_with_id=${targetUserId}`);
export const importDocumentFile = (formData) => api.post('/documents/import/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const attachFileToDoc = (id, formData) => api.post(`/documents/${id}/attach/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export default api;
