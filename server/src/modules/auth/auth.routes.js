const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./auth.controller');

const router = Router();

router.post('/login', asyncHandler(ctrl.login));
router.post('/register', authenticate, authorize('super_admin'), asyncHandler(ctrl.register));
router.post('/register-tenant', asyncHandler(ctrl.registerTenant));
router.get('/profile', authenticate, asyncHandler(ctrl.getProfile));
router.put('/change-password', authenticate, asyncHandler(ctrl.changePassword));
router.get('/users', authenticate, authorize('super_admin'), asyncHandler(ctrl.getUsers));
router.put('/users/:id', authenticate, authorize('super_admin'), asyncHandler(ctrl.updateUser));

module.exports = router;
