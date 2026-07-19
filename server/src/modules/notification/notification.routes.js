const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const ctrl = require('./notification.controller');

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(ctrl.getAll));
router.get('/unread-count', asyncHandler(ctrl.getUnreadCount));
router.put('/:id/read', asyncHandler(ctrl.markAsRead));
router.put('/mark-all-read', asyncHandler(ctrl.markAllAsRead));
router.post('/', asyncHandler(ctrl.create));

module.exports = router;
