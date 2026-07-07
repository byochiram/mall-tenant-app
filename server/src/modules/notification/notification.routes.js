const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const ctrl = require('./notification.controller');

const router = Router();
router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/unread-count', ctrl.getUnreadCount);
router.put('/:id/read', ctrl.markAsRead);
router.put('/mark-all-read', ctrl.markAllAsRead);
router.post('/', ctrl.create);

module.exports = router;
