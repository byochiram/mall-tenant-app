const { app, request, adminToken, leasingToken } = require('./helpers');

describe('Unit API', () => {
  let floorId;
  let unitId;

  describe('POST /api/units/floors', () => {
    it('should create a floor', async () => {
      const res = await request(app)
        .post('/api/units/floors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ number: '99', name: 'Test Floor' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Floor');
      floorId = res.body.id;
    });
  });

  describe('POST /api/units', () => {
    it('should create a unit', async () => {
      const res = await request(app)
        .post('/api/units')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          floorId,
          unitNumber: 'T-01',
          areaSqm: 50,
          unitType: 'retail',
          baseRentPerSqm: 150000,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.unitNumber).toBe('T-01');
      expect(res.body.status).toBe('available');
      unitId = res.body.id;
    });
  });

  describe('GET /api/units', () => {
    it('should return list of units', async () => {
      const res = await request(app)
        .get('/api/units')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/units/:id/assign', () => {
    it('should assign tenant to unit', async () => {
      const res = await request(app)
        .post(`/api/units/${unitId}/assign`)
        .set('Authorization', `Bearer ${leasingToken}`)
        .send({ tenantId: 1, startDate: new Date().toISOString() });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('tenant');
      expect(res.body).toHaveProperty('unit');
    });

    it('should not assign to already occupied unit', async () => {
      const res = await request(app)
        .post(`/api/units/${unitId}/assign`)
        .set('Authorization', `Bearer ${leasingToken}`)
        .send({ tenantId: 2, startDate: new Date().toISOString() });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/units/:id/unassign', () => {
    it('should unassign tenant from unit', async () => {
      const res = await request(app)
        .post(`/api/units/${unitId}/unassign`)
        .set('Authorization', `Bearer ${leasingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('berhasil di-unassign');
    });
  });

  describe('DELETE /api/units/:id', () => {
    it('should delete unit', async () => {
      const res = await request(app)
        .delete(`/api/units/${unitId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/units/floors/:id', () => {
    it('should delete floor', async () => {
      const res = await request(app)
        .delete(`/api/units/floors/${floorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
