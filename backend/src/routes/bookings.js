const express = require('express');
const {
  getBookings, getBooking, createBooking,
  confirmBooking, cancelBooking, completeBooking, stripeWebhook
} = require('../controllers/bookingController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getBookings);
router.get('/:id', auth, getBooking);
router.post('/', auth, requireRole('client'), createBooking);
router.post('/:id/confirm', auth, requireRole('provider'), confirmBooking);
router.post('/:id/cancel', auth, cancelBooking);
router.post('/:id/complete', auth, requireRole('provider'), completeBooking);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
