const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  phone: z.string().optional(),
  role: z.enum(['super_admin', 'leasing_manager', 'leasing_staff', 'finance_manager', 'accounting_staff', 'staff']).optional(),
});

const registerTenantSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(1, 'Nama wajib diisi').max(100),
  phone: z.string().optional(),
  tenantCode: z.string().min(1, 'Kode tenant wajib diisi'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});

module.exports = { loginSchema, registerSchema, registerTenantSchema, changePasswordSchema };
