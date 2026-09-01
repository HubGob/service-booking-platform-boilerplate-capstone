import { Router } from 'express';
import { getBookings, getBooking, createBooking, confirmBooking, cancelBooking, completeBooking, stripeWebhook } from '../controllers/bookingController';
import { auth, requireRole } from '../middleware/auth';
import express from 'express';

const router = Router();

router.get('/', auth, getBookings);
router.get('/:id', auth, getBooking);
router.post('/', auth, requireRole('client'), createBooking);
router.post('/:id/confirm', auth, requireRole('provider'), confirmBooking);
router.post('/:id/cancel', auth, cancelBooking);
router.post('/:id/complete', auth, requireRole('provider'), completeBooking);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;