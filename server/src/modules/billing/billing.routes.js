const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./billing.controller');

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(ctrl.getAll));
router.get('/:id', asyncHandler(ctrl.getById));
router.post('/', authorize('super_admin', 'finance_manager', 'accounting_staff'), asyncHandler(ctrl.create));
router.put('/:id/status', authorize('super_admin', 'finance_manager', 'accounting_staff'), asyncHandler(ctrl.updateStatus));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.remove));
router.post('/bulk-generate', authorize('super_admin', 'finance_manager'), asyncHandler(ctrl.bulkGenerate));

module.exports = router;
