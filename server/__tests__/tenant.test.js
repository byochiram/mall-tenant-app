const { app, request, adminToken, leasingToken } = require('./helpers');

describe('Tenant API', () => {
  let tenantId;

  describe('GET /api/tenants', () => {
    it('should return list of tenants', async () => {
      const res = await request(app)
        .get('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/tenants?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
      expect(res.body).toHaveProperty('totalPages');
    });

    it('should support search', async () => {
      const res = await request(app)
        .get('/api/tenants?search=TNT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/tenants');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/tenants', () => {
    it('should create a new tenant', async () => {
      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          businessName: 'Test Tenant',
          categoryId: 1,
          tenantType: 'inline',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.businessName).toBe('Test Tenant');
      expect(res.body).toHaveProperty('code');
      tenantId = res.body.id;
    });

    it('should reject without required fields', async () => {
      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ businessName: '' });

      expect(res.status).toBe(400);
    });

    it('should reject staff role', async () => {
      const jwt = require('jsonwebtoken');
      const staffToken = jwt.sign(
        { id: '70dcb84e-af40-4cfa-8e88-c918957e505f', email: 'staff@mall.com', role: 'staff', tenantId: null },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/api/tenants')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ businessName: 'Test', categoryId: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('should return tenant detail', async () => {
      const res = await request(app)
        .get(`/api/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(tenantId);
      expect(res.body).toHaveProperty('contacts');
      expect(res.body).toHaveProperty('contracts');
    });

    it('should return 404 for non-existent tenant', async () => {
      const res = await request(app)
        .get('/api/tenants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tenants/:id', () => {
    it('should update tenant', async () => {
      const res = await request(app)
        .put(`/api/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ businessName: 'Updated Tenant' });

      expect(res.status).toBe(200);
      expect(res.body.businessName).toBe('Updated Tenant');
    });
  });

  describe('DELETE /api/tenants/:id', () => {
    it('should soft delete tenant', async () => {
      const res = await request(app)
        .delete(`/api/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('berhasil dihapus');
    });

    it('should not show deleted tenant in list', async () => {
      const res = await request(app)
        .get('/api/tenants')
        .set('Authorization', `Bearer ${adminToken}`);

      const found = res.body.data.find(t => t.id === tenantId);
      expect(found).toBeUndefined();
    });
  });
});
