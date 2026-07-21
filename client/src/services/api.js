import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const registerTenant = (data) => api.post('/auth/register-tenant', data);
export const getProfile = () => api.get('/auth/profile');
export const getUsers = () => api.get('/auth/users');
export const updateUser = (id, data) => api.put(`/auth/users/${id}`, data);

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Tenants
export const getTenants = (params) => api.get('/tenants', { params });
export const getTenant = (id) => api.get(`/tenants/${id}`);
export const createTenant = (data) => api.post('/tenants', data);
export const updateTenant = (id, data) => api.put(`/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);
export const addTenantContact = (id, data) => api.post(`/tenants/${id}/contacts`, data);
export const updateTenantContact = (id, contactId, data) => api.put(`/tenants/${id}/contacts/${contactId}`, data);
export const deleteTenantContact = (id, contactId) => api.delete(`/tenants/${id}/contacts/${contactId}`);
export const addTenantNote = (id, data) => api.post(`/tenants/${id}/notes`, data);
export const addTenantDocument = (id, data) => api.post(`/tenants/${id}/documents`, data);
export const deleteTenantDocument = (id, docId) => api.delete(`/tenants/${id}/documents/${docId}`);

// Units
export const getFloors = () => api.get('/units/floors');
export const createFloor = (data) => api.post('/units/floors', data);
export const updateFloor = (id, data) => api.put(`/units/floors/${id}`, data);
export const deleteFloor = (id) => api.delete(`/units/floors/${id}`);
export const getUnits = (params) => api.get('/units', { params });
export const getUnit = (id) => api.get(`/units/${id}`);
export const createUnit = (data) => api.post('/units', data);
export const updateUnit = (id, data) => api.put(`/units/${id}`, data);
export const deleteUnit = (id) => api.delete(`/units/${id}`);
export const assignTenant = (id, data) => api.post(`/units/${id}/assign`, data);
export const unassignTenant = (id) => api.post(`/units/${id}/unassign`);

// Contracts
export const getContracts = (params) => api.get('/contracts', { params });
export const getContract = (id) => api.get(`/contracts/${id}`);
export const createContract = (data) => api.post('/contracts', data);
export const updateContract = (id, data) => api.put(`/contracts/${id}`, data);
export const approveContract = (id) => api.put(`/contracts/${id}/approve`);
export const terminateContract = (id) => api.put(`/contracts/${id}/terminate`);
export const deleteContract = (id) => api.delete(`/contracts/${id}`);
export const addRenewal = (id, data) => api.post(`/contracts/${id}/renewals`, data);
export const acceptRenewal = (id, renewalId) => api.put(`/contracts/${id}/renewals/${renewalId}/accept`);

// Billing
export const getInvoices = (params) => api.get('/billing', { params });
export const getInvoice = (id) => api.get(`/billing/${id}`);
export const createInvoice = (data) => api.post('/billing', data);
export const updateInvoiceStatus = (id, data) => api.put(`/billing/${id}/status`, data);
export const deleteInvoice = (id) => api.delete(`/billing/${id}`);
export const bulkGenerateInvoices = (data) => api.post('/billing/bulk-generate', data);

// Payments
export const getPayments = (params) => api.get('/payments', { params });
export const getPayment = (id) => api.get(`/payments/${id}`);
export const createPayment = (data) => api.post('/payments', data);
export const verifyPayment = (id, data) => api.put(`/payments/${id}/verify`, data);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
export const getAging = () => api.get('/payments/aging');

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/mark-all-read');

// Tenant Portal
export const getPortalProfile = () => api.get('/tenant-portal/profile');
export const getPortalInvoices = (params) => api.get('/tenant-portal/invoices', { params });
export const getPortalPayments = () => api.get('/tenant-portal/payments');
export const submitPortalPayment = (data) => api.post('/tenant-portal/payments', data);

// Upload
export const uploadProof = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;
