const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./contract.controller');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.create);
router.put('/:id', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.update);
router.put('/:id/approve', authorize('super_admin', 'leasing_manager'), ctrl.approve);
router.put('/:id/terminate', authorize('super_admin', 'leasing_manager'), ctrl.terminate);
router.delete('/:id', authorize('super_admin'), ctrl.remove);

router.post('/:id/renewals', authorize('super_admin', 'leasing_manager'), ctrl.addRenewal);
router.put('/:id/renewals/:renewalId/accept', authorize('super_admin', 'leasing_manager'), ctrl.acceptRenewal);

module.exports = router;
