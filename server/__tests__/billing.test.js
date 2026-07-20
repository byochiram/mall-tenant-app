const { app, request, adminToken, financeToken } = require('./helpers');

describe('Billing & Payment API', () => {
  let tenantId;
  let contractId;
  let invoiceId;
  let paymentId;

  beforeAll(async () => {
    // Create tenant
    const tenantRes = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ businessName: 'Billing Test Tenant', categoryId: 7 });
    tenantId = tenantRes.body.id;

    // Create contract
    const contractRes = await request(app)
      .post('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tenantId,
        contractType: 'new',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        durationMonths: 12,
        fixedRent: 5000000,
        rentPerSqm: 100000,
        paymentTerms: 'monthly',
        paymentDueDay: 5,
      });
    contractId = contractRes.body.id;
  });

  describe('Billing', () => {
    it('should return list of invoices', async () => {
      const res = await request(app)
        .get('/api/billing')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create an invoice', async () => {
      const res = await request(app)
        .post('/api/billing')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          tenantId,
          contractId,
          invoiceType: 'rent',
          period: '2026-09',
          dueDate: '2026-09-15',
          lineItems: [{ description: 'Sewa September', quantity: 1, unitPrice: 5000000 }],
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('invoiceNo');
      invoiceId = res.body.id;
    });

    it('should update invoice status', async () => {
      const res = await request(app)
        .put(`/api/billing/${invoiceId}/status`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ status: 'sent' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('sent');
    });
  });

  describe('Payment', () => {
    it('should return list of payments', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should create a payment', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          tenantId,
          amount: 5000000,
          paymentMethod: 'transfer',
          bankName: 'BCA',
          paymentDate: new Date().toISOString(),
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('paymentNo');
      paymentId = res.body.id;
    });

    it('should verify payment', async () => {
      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ status: 'verified' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('verified');
    });

    it('should return aging report', async () => {
      const res = await request(app)
        .get('/api/payments/aging')
        .set('Authorization', `Bearer ${financeToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
    });
  });
});
