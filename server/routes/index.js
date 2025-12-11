const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.use('/bookings', require('./BookingRoutes'));
router.use('/availability', require('./availabilityRoutes'));
router.use('/waitlist', require('./waitlistRoutes'));
router.use('/user', require('./userRoutes'));
router.use('/reservation', require('./reservationRoutes'));
router.use('/me', require('./meRoutes'));
router.use('/notifications', require('./notificationRoutes'));

router.use('/auth', require('./authRoutes'));


router.use('/courts', auth.verifyToken, auth.requireAdmin, require('./adminCourtRoutes'));
router.use('/equipment', auth.verifyToken, auth.requireAdmin, require('./adminEquipmentRoutes'));
router.use('/coaches', auth.verifyToken, auth.requireAdmin, require('./adminCoachRoutes'));
router.use('/pricing', auth.verifyToken, auth.requireAdmin, require('./adminPricingRoutes'));




module.exports = router;
