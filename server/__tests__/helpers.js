require('dotenv').config();
const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/utils/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const adminToken = jwt.sign(
  { id: 'd07964ef-242a-4925-9b04-a88f466f4d1e', email: 'admin@mall.com', role: 'super_admin', tenantId: null },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const leasingToken = jwt.sign(
  { id: 'a8ec1afe-3bbd-4f20-95e8-8236f33a306c', email: 'leasing@mall.com', role: 'leasing_manager', tenantId: null },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const financeToken = jwt.sign(
  { id: 'b1a62399-c11a-4632-a892-3605ecf6839e', email: 'finance@mall.com', role: 'finance_manager', tenantId: null },
  JWT_SECRET,
  { expiresIn: '1h' }
);

module.exports = {
  app,
  prisma,
  request,
  adminToken,
  leasingToken,
  financeToken,
};
