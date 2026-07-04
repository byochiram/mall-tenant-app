import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getDashboard = () => api.get('/dashboard');
export const getTenants = (params) => api.get('/tenants', { params });
export const getTenant = (id) => api.get(`/tenants/${id}`);
export const createTenant = (data) => api.post('/tenants', data);
export const updateTenant = (id, data) => api.put(`/tenants/${id}`, data);
export const deleteTenant = (id) => api.delete(`/tenants/${id}`);

export const getPayments = (params) => api.get('/payments', { params });
export const getPaymentsByTenant = (tenantId) => api.get(`/payments/tenant/${tenantId}`);
export const createPayment = (data) => api.post('/payments', data);
export const updatePaymentStatus = (id, status) => api.patch(`/payments/${id}/status`, { status });
export const deletePayment = (id) => api.delete(`/payments/${id}`);

export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
