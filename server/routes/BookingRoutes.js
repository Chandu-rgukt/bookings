const express = require('express');
const router = express.Router();
const { createBooking, pricePreview } = require('../controllers/BookingController');
router.post('/create', createBooking);
router.post('/preview', pricePreview);
module.exports = router;
