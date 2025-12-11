
const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/meController');
router.get('/', getMe);
module.exports = router;
