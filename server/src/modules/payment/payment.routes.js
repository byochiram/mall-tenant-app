const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./payment.controller');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/aging', ctrl.getAging);
router.get('/:id', ctrl.getById);
router.post('/', authorize('super_admin', 'finance_manager', 'accounting_staff'), ctrl.create);
router.put('/:id/verify', authorize('super_admin', 'finance_manager', 'accounting_staff'), ctrl.verify);
router.delete('/:id', authorize('super_admin'), ctrl.remove);

module.exports = router;
