const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./dashboard.controller');

const router = Router();
router.use(authenticate);
router.get('/', ctrl.getDashboard);

module.exports = router;
