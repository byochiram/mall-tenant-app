const prisma = require('../../utils/prisma');
const { generateTenantCode } = require('../../utils/helpers');

const getAll = async (req, res) => {
  try {
    const { status, category, tenantType, search, page = 1, limit = 50 } = req.query;
    const where = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.categoryId = parseInt(category);
    if (tenantType) where.tenantType = tenantType;
    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { brandName: { contains: search } },
        { code: { contains: search } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          category: true,
          contacts: { where: { isPrimary: true }, take: 1 },
          tenantUnits: { where: { isCurrent: true }, include: { unit: { include: { floor: true } } } },
          contracts: { where: { status: 'active' }, take: 1 },
          _count: { select: { invoices: true, payments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.tenant.count({ where }),
    ]);
    res.json({ data: tenants, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: parseInt(req.params.id), deletedAt: null },
      include: {
        category: true,
        contacts: { orderBy: { isPrimary: 'desc' } },
        tenantUnits: { include: { unit: { include: { floor: true } } }, orderBy: { startDate: 'desc' } },
        contracts: { orderBy: { createdAt: 'desc' }, include: { renewals: true } },
        invoices: { orderBy: { createdAt: 'desc' }, take: 20 },
        payments: { orderBy: { createdAt: 'desc' }, take: 20 },
        documents: true,
        tenantNotes: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant tidak ditemukan' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const code = await generateTenantCode(prisma);
    const tenant = await prisma.tenant.create({
      data: {
        ...req.body,
        code,
        joinDate: req.body.joinDate ? new Date(req.body.joinDate) : null,
      },
      include: { category: true },
    });
    res.status(201).json(tenant);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.joinDate) data.joinDate = new Date(data.joinDate);
    if (data.exitDate) data.exitDate = new Date(data.exitDate);
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

const remove = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return res.status(404).json({ error: 'Tenant tidak ditemukan' });
    if (tenant.deletedAt) return res.status(400).json({ error: 'Tenant sudah dihapus' });

    await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'terminated' },
    });
    res.json({ message: 'Tenant berhasil dihapus (soft delete)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.tenantContact.findMany({
      where: { tenantId: parseInt(req.params.id) },
      orderBy: { isPrimary: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addContact = async (req, res) => {
  try {
    const contact = await prisma.tenantContact.create({
      data: { ...req.body, tenantId: parseInt(req.params.id) },
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await prisma.tenantContact.update({
      where: { id: parseInt(req.params.contactId) },
      data: req.body,
    });
    res.json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeContact = async (req, res) => {
  try {
    await prisma.tenantContact.delete({ where: { id: parseInt(req.params.contactId) } });
    res.json({ message: 'Kontak berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Notes
const addNote = async (req, res) => {
  try {
    const note = await prisma.tenantNote.create({
      data: {
        tenantId: parseInt(req.params.id),
        noteType: req.body.noteType || 'general',
        content: req.body.content,
        createdBy: req.user.name,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Documents
const addDocument = async (req, res) => {
  try {
    const doc = await prisma.tenantDocument.create({
      data: {
        tenantId: parseInt(req.params.id),
        docType: req.body.docType,
        fileName: req.body.fileName,
        fileUrl: req.body.fileUrl || '#',
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        notes: req.body.notes,
      },
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeDocument = async (req, res) => {
  try {
    await prisma.tenantDocument.delete({ where: { id: parseInt(req.params.docId) } });
    res.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getContacts, addContact, updateContact, removeContact, addNote, addDocument, removeDocument };
