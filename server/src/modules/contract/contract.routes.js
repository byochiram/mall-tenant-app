const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./contract.controller');

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(ctrl.getAll));
router.get('/:id', asyncHandler(ctrl.getById));
router.post('/', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.create));
router.put('/:id', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.update));
router.put('/:id/approve', authorize('super_admin', 'leasing_manager'), asyncHandler(ctrl.approve));
router.put('/:id/terminate', authorize('super_admin', 'leasing_manager'), asyncHandler(ctrl.terminate));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.remove));

router.post('/:id/renewals', authorize('super_admin', 'leasing_manager'), asyncHandler(ctrl.addRenewal));
router.put('/:id/renewals/:renewalId/accept', authorize('super_admin', 'leasing_manager'), asyncHandler(ctrl.acceptRenewal));

module.exports = router;
