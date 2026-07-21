const { Router } = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./activity-log.controller');

const router = Router();
router.use(authenticate);
router.use(authorize('super_admin'));

router.get('/', asyncHandler(ctrl.getAll));

module.exports = router;
