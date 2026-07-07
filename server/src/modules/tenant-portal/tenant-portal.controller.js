const prisma = require('../../utils/prisma');
const { generatePaymentNo } = require('../../utils/helpers');

const getMyInvoices = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Akses ditolak' });
    const { status } = req.query;
    const where = { tenantId };
    if (status) where.status = status;
    const invoices = await prisma.invoice.findMany({
      where,
      include: { lineItems: true, payments: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Akses ditolak' });
    const payments = await prisma.payment.findMany({
      where: { tenantId },
      include: { invoice: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Akses ditolak' });
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        category: true,
        contacts: { orderBy: { isPrimary: 'desc' } },
        tenantUnits: { where: { isCurrent: true }, include: { unit: { include: { floor: true } } } },
        contracts: { where: { status: 'active' }, take: 1 },
      },
    });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const submitPayment = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(403).json({ error: 'Akses ditolak' });
    const { invoiceId, amount, paymentMethod, bankName, referenceNo, paymentDate, proofUrl, notes } = req.body;
    const paymentNo = generatePaymentNo();
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        invoiceId: invoiceId || null,
        paymentNo,
        amount: Number(amount),
        paymentMethod: paymentMethod || 'transfer',
        bankName,
        referenceNo,
        paymentDate: new Date(paymentDate),
        proofUrl: proofUrl || null,
        status: 'pending_verification',
        notes,
      },
      include: { invoice: true },
    });

    await prisma.notification.create({
      data: {
        title: 'Pembayaran Baru',
        message: `Tenant ${req.user.name} mengirim bukti pembayaran ${paymentNo} sebesar Rp ${Number(amount).toLocaleString('id-ID')}`,
        type: 'payment',
        link: '/payments',
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getMyInvoices, getMyPayments, getMyProfile, submitPayment };
