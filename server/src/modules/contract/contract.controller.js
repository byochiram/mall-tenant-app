const prisma = require('../../utils/prisma');
const { generateContractNo } = require('../../utils/helpers');

const getAll = async (req, res) => {
  try {
    const { status, tenantId, expiringSoon } = req.query;
    const where = {};
    if (status) where.status = status;
    if (tenantId) where.tenantId = parseInt(tenantId);
    if (expiringSoon === 'true') {
      const now = new Date();
      const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      where.endDate = { gte: now, lte: threeMonths };
      where.status = 'active';
    }
    const contracts = await prisma.leaseContract.findMany({
      where,
      include: { tenant: { select: { id: true, code: true, businessName: true, status: true } }, renewals: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const contract = await prisma.leaseContract.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { tenant: true, renewals: { orderBy: { createdAt: 'desc' } }, invoices: { orderBy: { createdAt: 'desc' }, take: 10 } },
    });
    if (!contract) return res.status(404).json({ error: 'Kontrak tidak ditemukan' });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const contractNumber = generateContractNo();
    const data = {
      ...req.body,
      contractNumber,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };
    const contract = await prisma.leaseContract.create({ data, include: { tenant: true } });
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const contract = await prisma.leaseContract.update({ where: { id: parseInt(req.params.id) }, data, include: { tenant: true } });
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const approve = async (req, res) => {
  try {
    const contract = await prisma.leaseContract.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'active', approvedBy: req.user.name, approvedAt: new Date(), signedAt: new Date() },
      include: { tenant: true },
    });
    await prisma.tenant.update({ where: { id: contract.tenantId }, data: { status: 'active', joinDate: contract.startDate } });
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const terminate = async (req, res) => {
  try {
    const contract = await prisma.leaseContract.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'terminated' },
    });
    await prisma.tenant.update({ where: { id: contract.tenantId }, data: { status: 'terminated', exitDate: new Date() } });
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const contract = await prisma.leaseContract.findUnique({ where: { id } });
    if (!contract) return res.status(404).json({ error: 'Kontrak tidak ditemukan' });

    const invoiceCount = await prisma.invoice.count({ where: { contractId: id } });
    if (invoiceCount > 0) {
      return res.status(400).json({ error: `Kontrak tidak bisa dihapus karena masih memiliki ${invoiceCount} invoice terkait` });
    }

    const paymentCount = await prisma.payment.count({ where: { invoice: { contractId: id } } });
    if (paymentCount > 0) {
      return res.status(400).json({ error: `Kontrak tidak bisa dihapus karena masih memiliki ${paymentCount} pembayaran terkait` });
    }

    await prisma.leaseRenewal.deleteMany({ where: { contractId: id } });
    await prisma.leaseContract.delete({ where: { id } });
    res.json({ message: 'Kontrak berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Renewals
const addRenewal = async (req, res) => {
  try {
    const contract = await prisma.leaseContract.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!contract) return res.status(404).json({ error: 'Kontrak tidak ditemukan' });
    const renewal = await prisma.leaseRenewal.create({
      data: {
        contractId: contract.id,
        previousEndDate: contract.endDate,
        newEndDate: new Date(req.body.newEndDate),
        newFixedRent: req.body.newFixedRent || contract.fixedRent,
        newRentPerSqm: req.body.newRentPerSqm || contract.rentPerSqm,
        status: req.body.status || 'offered',
        notes: req.body.notes,
      },
    });
    res.status(201).json(renewal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const acceptRenewal = async (req, res) => {
  try {
    const renewal = await prisma.leaseRenewal.update({
      where: { id: parseInt(req.params.renewalId) },
      data: { status: 'accepted' },
    });
    await prisma.leaseContract.update({
      where: { id: renewal.contractId },
      data: {
        endDate: renewal.newEndDate,
        fixedRent: renewal.newFixedRent,
        rentPerSqm: renewal.newRentPerSqm || undefined,
      },
    });
    res.json(renewal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, update, approve, terminate, remove, addRenewal, acceptRenewal };
