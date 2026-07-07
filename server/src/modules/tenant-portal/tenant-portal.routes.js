const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./tenant-portal.controller');

const router = Router();
router.use(authenticate);

router.get('/profile', ctrl.getMyProfile);
router.get('/invoices', ctrl.getMyInvoices);
router.get('/payments', ctrl.getMyPayments);
router.post('/payments', ctrl.submitPayment);

module.exports = router;
