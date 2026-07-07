const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./tenant.controller');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.create);
router.put('/:id', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.update);
router.delete('/:id', authorize('super_admin'), ctrl.remove);

router.get('/:id/contacts', ctrl.getContacts);
router.post('/:id/contacts', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.addContact);
router.put('/:id/contacts/:contactId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.updateContact);
router.delete('/:id/contacts/:contactId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.removeContact);

router.post('/:id/notes', ctrl.addNote);

router.post('/:id/documents', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.addDocument);
router.delete('/:id/documents/:docId', authorize('super_admin', 'leasing_manager', 'leasing_staff'), ctrl.removeDocument);

module.exports = router;
