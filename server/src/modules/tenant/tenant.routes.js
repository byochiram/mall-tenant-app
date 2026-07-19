const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./tenant.controller');

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(ctrl.getAll));
router.get('/:id', asyncHandler(ctrl.getById));
router.post('/', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.create));
router.put('/:id', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.update));
router.delete('/:id', authorize('super_admin'), asyncHandler(ctrl.remove));

router.get('/:id/contacts', asyncHandler(ctrl.getContacts));
router.post('/:id/contacts', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.addContact));
router.put('/:id/contacts/:contactId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.updateContact));
router.delete('/:id/contacts/:contactId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.removeContact));

router.post('/:id/notes', asyncHandler(ctrl.addNote));

router.post('/:id/documents', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.addDocument));
router.delete('/:id/documents/:docId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), asyncHandler(ctrl.removeDocument));

module.exports = router;
