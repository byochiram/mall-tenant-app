const { app, request, adminToken, financeToken } = require('./helpers');

describe('Billing API', () => {
  let invoiceId;

  describe('GET /api/billing', () => {
    it('should return list of invoices', async () => {
      const res = await request(app)
        .get('/api/billing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should support status filter', async () => {
      const res = await request(app)
        .get('/api/billing?status=sent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/billing', () => {
    it('should create an invoice', async () => {
      const res = await request(app)
        .post('/api/billing')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          tenantId: 1,
          contractId: 1,
          invoiceType: 'rent',
          period: '2026-08',
          dueDate: '2026-08-15',
          lineItems: [
            { description: 'Sewa Agustus', quantity: 1, unitPrice: 5000000 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('invoiceNo');
      expect(res.body.totalAmount).toBe(5000000);
      invoiceId = res.body.id;
    });
  });

  describe('GET /api/billing/:id', () => {
    it('should return invoice detail', async () => {
      const res = await request(app)
        .get(`/api/billing/${invoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(invoiceId);
      expect(res.body).toHaveProperty('lineItems');
    });
  });

  describe('PUT /api/billing/:id/status', () => {
    it('should update invoice status', async () => {
      const res = await request(app)
        .put(`/api/billing/${invoiceId}/status`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ status: 'sent' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('sent');
    });
  });
});

describe('Payment API', () => {
  let paymentId;

  describe('GET /api/payments', () => {
    it('should return list of payments', async () => {
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/payments', () => {
    it('should create a payment', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          tenantId: 1,
          amount: 5000000,
          paymentMethod: 'transfer',
          bankName: 'BCA',
          paymentDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('paymentNo');
      expect(res.body.status).toBe('pending_verification');
      paymentId = res.body.id;
    });
  });

  describe('PUT /api/payments/:id/verify', () => {
    it('should verify payment', async () => {
      const res = await request(app)
        .put(`/api/payments/${paymentId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({ status: 'verified' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('verified');
      expect(res.body).toHaveProperty('verifiedBy');
    });
  });

  describe('GET /api/payments/aging', () => {
    it('should return aging report', async () => {
      const res = await request(app)
        .get('/api/payments/aging')
        .set('Authorization', `Bearer ${financeToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
      expect(res.body).toHaveProperty('details');
      expect(res.body.summary).toHaveProperty('current');
      expect(res.body.summary).toHaveProperty('days30');
    });
  });
});
