const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./tenant-portal.controller');

const router = Router();
router.use(authenticate);

router.get('/profile', asyncHandler(ctrl.getMyProfile));
router.get('/invoices', asyncHandler(ctrl.getMyInvoices));
router.get('/payments', asyncHandler(ctrl.getMyPayments));
router.post('/payments', asyncHandler(ctrl.submitPayment));

module.exports = router;
