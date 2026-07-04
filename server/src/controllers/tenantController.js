const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllTenants = async (req, res) => {
  try {
    const { status, category, floor, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.categoryId = parseInt(category);
    if (floor) where.floor = floor;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { unitNumber: { contains: search } },
      ];
    }
    const tenants = await prisma.tenant.findMany({
      where,
      include: { category: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTenantById = async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, payments: { orderBy: { createdAt: 'desc' } } },
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTenant = async (req, res) => {
  try {
    const tenant = await prisma.tenant.create({
      data: {
        ...req.body,
        leaseStart: new Date(req.body.leaseStart),
        leaseEnd: new Date(req.body.leaseEnd),
      },
      include: { category: true },
    });
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTenant = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.leaseStart) data.leaseStart = new Date(data.leaseStart);
    if (data.leaseEnd) data.leaseEnd = new Date(data.leaseEnd);
    const tenant = await prisma.tenant.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { category: true },
    });
    res.json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteTenant = async (req, res) => {
  try {
    await prisma.payment.deleteMany({ where: { tenantId: parseInt(req.params.id) } });
    await prisma.tenant.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Tenant deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllTenants, getTenantById, createTenant, updateTenant, deleteTenant };
