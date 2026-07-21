const prisma = require('../../utils/prisma');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, module: mod, action, userId } = req.query;
    const where = {};
    if (mod) where.module = mod;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({ data: logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAll };
