const bcrypt = require('bcryptjs');
const prisma = require('../../utils/prisma');
const { generateToken } = require('../../utils/jwt');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Akun Anda tidak aktif' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, phone, role, tenantId } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone, role: role || 'staff', tenantId: tenantId || null },
    });
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    res.status(201).json({ token, user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, role: true, tenantId: true, status: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, phone: true, role: true, status: true, tenantId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone, role, status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, role, status },
      select: { id: true, email: true, name: true, phone: true, role: true, status: true, tenantId: true },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Password lama salah' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const registerTenant = async (req, res) => {
  try {
    const { email, password, name, phone, businessName, tenantCode } = req.body;
    if (!email || !password || !name || !tenantCode) {
      return res.status(400).json({ error: 'Email, password, nama, dan kode tenant wajib diisi' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email sudah terdaftar' });
    }
    const tenant = await prisma.tenant.findUnique({ where: { code: tenantCode } });
    if (!tenant) {
      return res.status(400).json({ error: 'Kode tenant tidak ditemukan' });
    }
    const existingUser = await prisma.user.findFirst({ where: { tenantId: tenant.id, role: 'tenant_user' } });
    if (existingUser) {
      return res.status(400).json({ error: 'Tenant ini sudah memiliki akun' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, phone, role: 'tenant_user', tenantId: tenant.id },
    });
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    res.status(201).json({ token, user: userData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { login, register, registerTenant, getProfile, getUsers, updateUser, changePassword };
