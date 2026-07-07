const prisma = require('../../utils/prisma');
const { generateInvoiceNo } = require('../../utils/helpers');

const getAll = async (req, res) => {
  try {
    const { status, invoiceType, tenantId, period } = req.query;
    const where = {};
    if (status) where.status = status;
    if (invoiceType) where.invoiceType = invoiceType;
    if (tenantId) where.tenantId = parseInt(tenantId);
    if (period) where.period = period;
    const invoices = await prisma.invoice.findMany({
      where,
      include: { tenant: { select: { id: true, code: true, businessName: true } }, lineItems: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { tenant: true, lineItems: true, payments: true, contract: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice tidak ditemukan' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const { tenantId, contractId, invoiceType, period, lineItems, taxPercent, discount, notes, dueDate } = req.body;
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * ((taxPercent || 0) / 100);
    const totalAmount = subtotal + taxAmount - (discount || 0);
    const invoiceNo = generateInvoiceNo();

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        contractId: contractId || null,
        invoiceNo,
        period,
        invoiceType: invoiceType || 'rent',
        subtotal,
        taxPercent: taxPercent || 0,
        taxAmount,
        discount: discount || 0,
        totalAmount,
        issueDate: new Date(),
        dueDate: new Date(dueDate),
        notes,
        lineItems: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { tenant: true, lineItems: true },
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const data = { status: req.body.status };
    if (data.status === 'paid') data.paidDate = new Date();
    const invoice = await prisma.invoice.update({ where: { id: parseInt(req.params.id) }, data, include: { tenant: true, lineItems: true } });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
    await prisma.payment.updateMany({ where: { invoiceId: id }, data: { invoiceId: null } });
    await prisma.invoice.delete({ where: { id } });
    res.json({ message: 'Invoice berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const bulkGenerate = async (req, res) => {
  try {
    const { period, invoiceType, dueDate } = req.body;
    const activeContracts = await prisma.leaseContract.findMany({
      where: { status: 'active' },
      include: { tenant: { select: { id: true, businessName: true } } },
    });

    let created = 0;
    let skipped = 0;
    const results = [];

    for (const contract of activeContracts) {
      const exists = await prisma.invoice.findFirst({ where: { tenantId: contract.tenantId, period, invoiceType: invoiceType || 'rent' } });
      if (exists) { skipped++; continue; }

      let amount = contract.fixedRent;
      let desc = `Sewa bulanan ${period}`;
      if (invoiceType === 'service_charge') { amount = contract.serviceCharge; desc = `Service charge ${period}`; }
      if (!amount || amount <= 0) { skipped++; continue; }

      const invoiceNo = generateInvoiceNo();
      await prisma.invoice.create({
        data: {
          tenantId: contract.tenantId,
          contractId: contract.id,
          invoiceNo,
          period,
          invoiceType: invoiceType || 'rent',
          subtotal: amount,
          taxPercent: 0,
          taxAmount: 0,
          discount: 0,
          totalAmount: amount,
          issueDate: new Date(),
          dueDate: new Date(dueDate),
          status: 'sent',
          lineItems: { create: [{ description: desc, quantity: 1, unitPrice: amount, amount }] },
        },
      });
      created++;
      results.push({ tenant: contract.tenant.businessName, invoiceNo, amount });
    }

    res.json({ message: `Bulk generate selesai: ${created} dibuat, ${skipped} dilewati`, created, skipped, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, updateStatus, remove, bulkGenerate };
