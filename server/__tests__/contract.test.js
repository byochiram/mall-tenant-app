const { app, request, adminToken, leasingToken } = require('./helpers');

describe('Contract API', () => {
  let contractId;
  let testTenantId;

  beforeAll(async () => {
    // Create a test tenant for contracts
    const res = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ businessName: 'Contract Test Tenant', categoryId: 1, tenantType: 'inline' });
    testTenantId = res.body.id;
  });

  describe('GET /api/contracts', () => {
    it('should return list of contracts', async () => {
      const res = await request(app)
        .get('/api/contracts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should support status filter', async () => {
      const res = await request(app)
        .get('/api/contracts?status=active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/contracts', () => {
    it('should create a contract', async () => {
      const res = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${leasingToken}`)
        .send({
          tenantId: testTenantId,
          contractType: 'new',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          durationMonths: 12,
          fixedRent: 5000000,
          rentPerSqm: 150000,
          serviceCharge: 500000,
          paymentTerms: 'monthly',
          paymentDueDay: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('contractNumber');
      expect(res.body.status).toBe('draft');
      contractId = res.body.id;
    });
  });

  describe('PUT /api/contracts/:id/approve', () => {
    it('should approve contract', async () => {
      const res = await request(app)
        .put(`/api/contracts/${contractId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('active');
      expect(res.body).toHaveProperty('approvedBy');
    });
  });

  describe('PUT /api/contracts/:id/terminate', () => {
    it('should terminate contract', async () => {
      const res = await request(app)
        .put(`/api/contracts/${contractId}/terminate`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('terminated');
    });
  });

  describe('DELETE /api/contracts/:id', () => {
    it('should delete contract without invoices', async () => {
      const createRes = await request(app)
        .post('/api/contracts')
        .set('Authorization', `Bearer ${leasingToken}`)
        .send({
          tenantId: testTenantId,
          contractType: 'new',
          startDate: '2027-01-01',
          endDate: '2027-12-31',
          durationMonths: 12,
          fixedRent: 3000000,
          rentPerSqm: 100000,
          paymentTerms: 'monthly',
          paymentDueDay: 5,
        });

      const res = await request(app)
        .delete(`/api/contracts/${createRes.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('berhasil dihapus');
    });
  });
});
