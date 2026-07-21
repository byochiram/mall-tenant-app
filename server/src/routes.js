const { Router } = require('express');
const prisma = require('./utils/prisma');

const authRoutes = require('./modules/auth/auth.routes');
const tenantRoutes = require('./modules/tenant/tenant.routes');
const unitRoutes = require('./modules/unit/unit.routes');
const contractRoutes = require('./modules/contract/contract.routes');
const billingRoutes = require('./modules/billing/billing.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const tenantPortalRoutes = require('./modules/tenant-portal/tenant-portal.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const activityLogRoutes = require('./modules/activity-log/activity-log.routes');
const { authenticate, authorize } = require('./middleware/auth');

const app = Router();

app.use('/auth', authRoutes);
app.use('/tenants', tenantRoutes);
app.use('/units', unitRoutes);
app.use('/contracts', contractRoutes);
app.use('/billing', billingRoutes);
app.use('/payments', paymentRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/notifications', notificationRoutes);
app.use('/tenant-portal', tenantPortalRoutes);
app.use('/upload', uploadRoutes);
app.use('/activity-logs', activityLogRoutes);

app.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { tenants: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/categories', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/categories/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const category = await prisma.category.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/categories/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const tenantCount = await prisma.tenant.count({ where: { categoryId: parseInt(req.params.id) } });
    if (tenantCount > 0) return res.status(400).json({ error: 'Tidak bisa hapus kategori yang masih digunakan' });
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
