const prisma = require('./prisma');

async function logActivity({ userId, userName, userRole, action, module, entityId, entityName, details, ipAddress }) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'System',
        userRole: userRole || 'system',
        action,
        module,
        entityId: entityId || null,
        entityName: entityName || null,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('[AUDIT] Gagal menyimpan log:', error.message);
  }
}

function getIpAddress(req) {
  return req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || null;
}

module.exports = { logActivity, getIpAddress };
