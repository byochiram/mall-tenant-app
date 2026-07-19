const { z } = require('zod');

const createTenantSchema = z.object({
  businessName: z.string().min(1, 'Nama usaha wajib diisi').max(200),
  legalName: z.string().max(200).optional(),
  brandName: z.string().max(100).optional(),
  categoryId: z.number().int().positive('Kategori wajib dipilih'),
  tenantType: z.enum(['inline', 'anchor', 'kiosk', 'popup', 'seasonal']).optional(),
  status: z.enum(['prospect', 'active', 'suspended', 'terminated']).optional(),
  joinDate: z.string().optional(),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

const updateTenantSchema = createTenantSchema.partial();

module.exports = { createTenantSchema, updateTenantSchema };
