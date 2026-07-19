const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET tidak ditemukan di environment. Tambahkan di file .env');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
