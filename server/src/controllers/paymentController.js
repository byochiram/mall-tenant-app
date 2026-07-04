const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateInvoiceNo = () => {
  const date = new Date();
  const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${random}`;
};

const getAllPayments = async (req, res) => {
  try {
    const { status, type, tenantId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (tenantId) where.tenantId = parseInt(tenantId);
    const payments = await prisma.payment.findMany({
      where,
      include: { tenant: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentsByTenant = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { tenantId: parseInt(req.params.tenantId) },
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPayment = async (req, res) => {
  try {
    const payment = await prisma.payment.create({
      data: {
        ...req.body,
        invoiceNo: generateInvoiceNo(),
        dueDate: new Date(req.body.dueDate),
        paidDate: req.body.paidDate ? new Date(req.body.paidDate) : null,
      },
      include: { tenant: true },
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const data = { status };
    if (status === 'paid') data.paidDate = new Date();
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { tenant: true },
    });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPayments, getPaymentsByTenant, createPayment, updatePaymentStatus, deletePayment };
