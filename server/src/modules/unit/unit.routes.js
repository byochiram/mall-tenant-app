const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./unit.controller');

const router = Router();
router.use(authenticate);

router.get('/floors', ctrl.getFloors);
router.post('/floors', authorize('super_admin'), ctrl.createFloor);
router.put('/floors/:id', authorize('super_admin'), ctrl.updateFloor);
router.delete('/floors/:id', authorize('super_admin'), ctrl.removeFloor);

router.get('/', ctrl.getUnits);
router.get('/:id', ctrl.getUnitById);
router.post('/', authorize('super_admin'), ctrl.createUnit);
router.put('/:id', authorize('super_admin'), ctrl.updateUnit);
router.delete('/:id', authorize('super_admin'), ctrl.removeUnit);

router.post('/:id/assign', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.assignTenant);
router.post('/:id/unassign', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.unassignTenant);

module.exports = router;
