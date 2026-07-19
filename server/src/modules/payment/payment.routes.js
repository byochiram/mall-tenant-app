const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./payment.controller');

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(ctrl.getAll));
router.get('/aging', asyncHandler(ctrl.getAging));
router.get('/:id', asyncHandler(ctrl.getById));
router.post('/', authorize('super_admin', 'finance_manager', 'accounting_staff'), asyncHandler(ctrl.create));
router.put('/:id/verify', authorize('super_admin', 'finance_manager', 'accounting_staff'), asyncHandler(ctrl.verify));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.remove));

module.exports = router;
