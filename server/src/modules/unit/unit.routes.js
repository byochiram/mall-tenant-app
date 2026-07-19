const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./unit.controller');

const router = Router();
router.use(authenticate);

router.get('/floors', asyncHandler(ctrl.getFloors));
router.post('/floors', authorize('super_admin'), asyncHandler(ctrl.createFloor));
router.put('/floors/:id', authorize('super_admin'), asyncHandler(ctrl.updateFloor));
router.delete('/floors/:id', authorize('super_admin'), asyncHandler(ctrl.removeFloor));

router.get('/', asyncHandler(ctrl.getUnits));
router.get('/:id', asyncHandler(ctrl.getUnitById));
router.post('/', authorize('super_admin'), asyncHandler(ctrl.createUnit));
router.put('/:id', authorize('super_admin'), asyncHandler(ctrl.updateUnit));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.removeUnit));

router.post('/:id/assign', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.assignTenant));
router.post('/:id/unassign', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.unassignTenant));

module.exports = router;
