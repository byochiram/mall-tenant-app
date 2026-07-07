const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./billing.controller');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('super_admin', 'finance_manager', 'accounting_staff'), ctrl.create);
router.put('/:id/status', authorize('super_admin', 'finance_manager', 'accounting_staff'), ctrl.updateStatus);
router.delete('/:id', authorize('super_admin'), ctrl.remove);
router.post('/bulk-generate', authorize('super_admin', 'finance_manager'), ctrl.bulkGenerate);

module.exports = router;
