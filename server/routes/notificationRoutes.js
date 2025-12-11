const express = require('express');
const router = express.Router();
const { listNotifications, markRead } = require('../controllers/notificationController');
router.get('/:userId', listNotifications);
router.post('/:id/read', markRead);
module.exports = router;
