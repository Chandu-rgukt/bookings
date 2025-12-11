const express = require('express');
const router = express.Router();
const { createLock, issueToken, releaseLock } = require('../controllers/reservationController');
router.post('/lock', createLock);
router.post('/token', issueToken);
router.post('/release', releaseLock);
module.exports = router;
