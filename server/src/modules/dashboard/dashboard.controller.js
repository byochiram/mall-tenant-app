const prisma = require('../../utils/prisma');

const getDashboard = async (req, res) => {
  try {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { status: 'active' } });
    const prospectTenants = await prisma.tenant.count({ where: { status: 'prospect' } });
    const terminatedTenants = await prisma.tenant.count({ where: { status: 'terminated' } });

    const totalUnits = await prisma.unit.count();
    const occupiedUnits = await prisma.unit.count({ where: { status: 'occupied' } });
    const availableUnits = await prisma.unit.count({ where: { status: 'available' } });
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

    const allInvoices = await prisma.invoice.findMany({ include: { payments: { where: { status: 'verified' } } } });
    let totalRevenue = 0, totalPending = 0, totalOverdue = 0;
    for (const inv of allInvoices) {
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      if (inv.status === 'paid') totalRevenue += inv.totalAmount;
      else if (inv.status === 'overdue') totalOverdue += (inv.totalAmount - paid);
      else totalPending += (inv.totalAmount - paid);
    }

    const activeContracts = await prisma.leaseContract.count({ where: { status: 'active' } });
    const pendingApproval = await prisma.leaseContract.count({ where: { status: 'draft' } });
    const now = new Date();
    const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const expiringContracts = await prisma.leaseContract.count({
      where: { status: 'active', endDate: { gte: now, lte: threeMonths } },
    });

    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { code: true, businessName: true } }, invoice: true },
    });

    const categoryStats = await prisma.category.findMany({
      include: {
        _count: { select: { tenants: true } },
        tenants: { where: { status: 'active' } },
      },
    });

    const tenantsByFloor = await prisma.unit.groupBy({
      by: ['floorId'],
      _count: true,
      where: { status: 'occupied' },
    });
    const floors = await prisma.floor.findMany({ orderBy: { number: 'asc' } });
    const floorStats = floors.map((f) => {
      const match = tenantsByFloor.find((t) => t.floorId === f.id);
      return { floor: f.number, name: f.name, count: match ? match._count : 0 };
    });

    res.json({
      overview: { totalTenants, activeTenants, prospectTenants, terminatedTenants },
      occupancy: { totalUnits, occupiedUnits, availableUnits, occupancyRate: parseFloat(occupancyRate) },
      financial: { totalRevenue, totalPending, totalOverdue },
      contracts: { activeContracts, expiringContracts, pendingApproval },
      recentPayments,
      categoryStats: categoryStats.map((c) => ({ name: c.name, count: c._count.tenants })),
      floorStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard };
