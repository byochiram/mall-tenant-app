const prisma = require('../../utils/prisma');

const getAll = async (req, res) => {
  try {
    const { isRead, type } = req.query;
    const where = {};
    if (req.user.tenantId) where.tenantId = req.user.tenantId;
    if (req.user.role !== 'tenant_user') where.userId = req.user.id;
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type) where.type = type;
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const where = { isRead: false };
    if (req.user.tenantId) where.tenantId = req.user.tenantId;
    else where.userId = req.user.id;
    const count = await prisma.notification.count({ where });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const where = { isRead: false };
    if (req.user.tenantId) where.tenantId = req.user.tenantId;
    else where.userId = req.user.id;
    await prisma.notification.updateMany({ where, data: { isRead: true } });
    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const notification = await prisma.notification.create({ data: req.body });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAll, getUnreadCount, markAsRead, markAllAsRead, create };
