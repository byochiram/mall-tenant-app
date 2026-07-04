const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { status: 'active' } });
    const inactiveTenants = await prisma.tenant.count({ where: { status: 'inactive' } });

    const totalPayments = await prisma.payment.count();
    const paidPayments = await prisma.payment.findMany({ where: { status: 'paid' } });
    const pendingPayments = await prisma.payment.findMany({ where: { status: 'pending' } });
    const overduePayments = await prisma.payment.findMany({ where: { status: 'overdue' } });

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { tenant: true },
    });

    const categoryStats = await prisma.category.findMany({
      include: {
        _count: { select: { tenants: true } },
        tenants: {
          include: {
            payments: { where: { status: 'paid' } },
          },
        },
      },
    });

    const categoryRevenue = categoryStats.map((cat) => ({
      name: cat.name,
      tenantCount: cat._count.tenants,
      revenue: cat.tenants.reduce(
        (sum, t) => sum + t.payments.reduce((s, p) => s + p.amount, 0),
        0
      ),
    }));

    const tenantsByFloor = await prisma.tenant.groupBy({
      by: ['floor'],
      _count: true,
      orderBy: { floor: 'asc' },
    });

    res.json({
      totalTenants,
      activeTenants,
      inactiveTenants,
      totalPayments,
      totalRevenue,
      totalPending,
      totalOverdue,
      recentPayments,
      categoryRevenue,
      tenantsByFloor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardStats };
