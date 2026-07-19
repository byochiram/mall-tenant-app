const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./dashboard.controller');

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(ctrl.getDashboard));

module.exports = router;
