const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true, tenantId: true },
    });
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User tidak valid atau nonaktif' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid atau expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Anda tidak memiliki akses untuk fitur ini' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
