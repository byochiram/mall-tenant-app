require('dotenv').config();
const request = require('supertest');
const app = require('../src/index');
const prisma = require('../src/utils/prisma');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const adminToken = jwt.sign(
  { id: 'a44f3d97-f9e1-462f-8c02-6e2f01fd80e2', email: 'admin@mall.com', role: 'super_admin', tenantId: null },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const leasingToken = jwt.sign(
  { id: '0a0fa721-9e5b-447c-9ac7-8e2ef8223352', email: 'leasing@mall.com', role: 'leasing_manager', tenantId: null },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const financeToken = jwt.sign(
  { id: '9be00e21-d9d9-4e12-bb3a-adfc47957c0c', email: 'finance@mall.com', role: 'finance_manager', tenantId: null },
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
