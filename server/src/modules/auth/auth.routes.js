const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');
const validate = require('../../middleware/validate');
const asyncHandler = require('../../utils/asyncHandler');
const { loginSchema, registerSchema, registerTenantSchema, changePasswordSchema } = require('../../validations/auth.validation');
const ctrl = require('./auth.controller');

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), asyncHandler(ctrl.login));
router.post('/register', authenticate, authorize('super_admin'), validate(registerSchema), asyncHandler(ctrl.register));
router.post('/register-tenant', validate(registerTenantSchema), asyncHandler(ctrl.registerTenant));
router.get('/profile', authenticate, asyncHandler(ctrl.getProfile));
router.put('/change-password', authenticate, validate(changePasswordSchema), asyncHandler(ctrl.changePassword));
router.get('/users', authenticate, authorize('super_admin'), asyncHandler(ctrl.getUsers));
router.put('/users/:id', authenticate, authorize('super_admin'), asyncHandler(ctrl.updateUser));

module.exports = router;
