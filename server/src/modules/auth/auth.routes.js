const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const ctrl = require('./auth.controller');

const router = Router();

router.post('/login', ctrl.login);
router.post('/register', authenticate, authorize('super_admin'), ctrl.register);
router.post('/register-tenant', ctrl.registerTenant);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/change-password', authenticate, ctrl.changePassword);
router.get('/users', authenticate, authorize('super_admin'), ctrl.getUsers);
router.put('/users/:id', authenticate, authorize('super_admin'), ctrl.updateUser);

module.exports = router;
