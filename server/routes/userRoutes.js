const express = require('express');
const router = express.Router();
const { listUserBookings, cancelBooking } = require('../controllers/userBookingController');
router.get('/:userId/bookings', listUserBookings);
router.post('/booking/:id/cancel', cancelBooking);
module.exports = router;
