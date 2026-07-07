const prisma = require('../../utils/prisma');
const { generatePaymentNo } = require('../../utils/helpers');

const getAll = async (req, res) => {
  try {
    const { status, paymentMethod, tenantId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (tenantId) where.tenantId = parseInt(tenantId);
    const payments = await prisma.payment.findMany({
      where,
      include: { tenant: { select: { id: true, code: true, businessName: true } }, invoice: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { tenant: true, invoice: { include: { lineItems: true } } },
    });
    if (!payment) return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const paymentNo = generatePaymentNo();
    const payment = await prisma.payment.create({
      data: {
        ...req.body,
        paymentNo,
        paymentDate: new Date(req.body.paymentDate),
        invoiceId: req.body.invoiceId || null,
      },
      include: { tenant: true, invoice: true },
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verify = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await prisma.payment.update({
      where: { id: parseInt(req.params.id) },
      data: { status, verifiedBy: req.user.name, verifiedAt: new Date() },
      include: { tenant: true, invoice: true },
    });
    if (status === 'verified' && payment.invoiceId) {
      const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
      const allPayments = await prisma.payment.findMany({ where: { invoiceId: payment.invoiceId, status: 'verified' } });
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= invoice.totalAmount) {
        await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: 'paid', paidDate: new Date() } });
      }
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await prisma.payment.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Pembayaran berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAging = async (req, res) => {
  try {
    const unpaidInvoices = await prisma.invoice.findMany({
      where: { status: { in: ['sent', 'pending', 'overdue'] } },
      include: { tenant: { select: { id: true, code: true, businessName: true } }, payments: { where: { status: 'verified' } } },
    });
    const now = new Date();
    const aging = { current: [], days30: [], days60: [], days90: [], over90: [] };
    for (const inv of unpaidInvoices) {
      const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstanding = inv.totalAmount - paidAmount;
      if (outstanding <= 0) continue;
      const daysOverdue = Math.floor((now - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
      const entry = { ...inv, outstanding, daysOverdue, paidAmount };
      if (daysOverdue <= 0) aging.current.push(entry);
      else if (daysOverdue <= 30) aging.days30.push(entry);
      else if (daysOverdue <= 60) aging.days60.push(entry);
      else if (daysOverdue <= 90) aging.days90.push(entry);
      else aging.over90.push(entry);
    }
    const summary = {
      current: { count: aging.current.length, total: aging.current.reduce((s, i) => s + i.outstanding, 0) },
      days30: { count: aging.days30.length, total: aging.days30.reduce((s, i) => s + i.outstanding, 0) },
      days60: { count: aging.days60.length, total: aging.days60.reduce((s, i) => s + i.outstanding, 0) },
      days90: { count: aging.days90.length, total: aging.days90.reduce((s, i) => s + i.outstanding, 0) },
      over90: { count: aging.over90.length, total: aging.over90.reduce((s, i) => s + i.outstanding, 0) },
    };
    res.json({ summary, details: aging });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, verify, remove, getAging };
