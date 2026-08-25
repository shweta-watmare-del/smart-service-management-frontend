import axios from 'axios';

   const api = axios.create({
     baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8084'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== Complaint APIs ====================

export const getMyComplaints = () => api.get('/complaints/user/my-complaints');
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (data) => api.post('/complaints', data);
export const cancelComplaint = (id) => api.put(`/complaints/${id}/cancel`);
export const getComplaintHistory = (id) => api.get(`/complaints/${id}/history`);
export const getFeedback = (complaintId) => api.get(`/complaints/${complaintId}/feedback`);
export const submitFeedback = (complaintId, data) => api.post(`/complaints/${complaintId}/feedback`, data);

// ==================== Category APIs ====================

export const getAllCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// ==================== User APIs ====================

export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (id, data) => api.put(`/users/${id}`, data);

// ==================== Admin APIs ====================

export const getAdminDashboardStats = () => api.get('/admin/dashboard');
export const getAllComplaintsAdmin = () => api.get('/admin/complaints');
export const getAllTechnicians = () => api.get('/admin/technicians');
export const createTechnician = (userId, specialization) =>
  api.post(`/admin/technicians?userId=${userId}&specialization=${specialization}`);
export const assignTechnicianToComplaint = (complaintId, technicianId) =>
  api.put(`/admin/complaints/${complaintId}/assign/${technicianId}`);
export const setComplaintPriority = (complaintId, priority) =>
  api.put(`/admin/complaints/${complaintId}/priority?priority=${priority}`);
export const getAllUsersAdmin = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const updateTechnicianStatus = (techId, availabilityStatus) =>
  api.put(`/admin/technicians/${techId}?availabilityStatus=${availabilityStatus}`);

// ==================== Technician APIs ====================

export const getTechnicianDashboardStats = () => api.get('/technician/dashboard');
export const getAssignedComplaints = () => api.get('/technician/complaints');
export const acceptComplaint = (id) => api.put(`/technician/complaints/${id}/accept`);
export const startWork = (id) => api.put(`/technician/complaints/${id}/start`);
export const resolveComplaint = (id, notes, resolutionImages = '') =>
  api.put(`/technician/complaints/${id}/resolve`, { complaintId: id, notes, resolutionImages });
export default api;export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
