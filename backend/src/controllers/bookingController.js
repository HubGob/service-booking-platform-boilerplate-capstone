const Booking = require('../models/Booking');
const Service = require('../models/Service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const hasConflict = async (providerId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    provider: providerId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return (await Booking.countDocuments(query)) > 0;
};

exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') query.client = req.user.id;
    else if (req.user.role === 'provider') query.provider = req.user.id;
    else return res.status(403).json({ message: 'Unknown role' });

    const { status, page = 1, limit = 20 } = req.query;
    if (status) query.status = status;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('client', 'name email avatar')
        .populate('provider', 'name email avatar')
        .populate('service', 'title category price durationMinutes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    res.json({ bookings, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('service', 'title category price durationMinutes');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.client._id.toString() !== req.user.id && booking.provider._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can create bookings' });

    const { serviceId, startTime, endTime, notes } = req.body;
    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) return res.status(404).json({ message: 'Service not found' });

    const conflict = await hasConflict(service.provider, new Date(startTime), new Date(endTime));
    if (conflict) return res.status(409).json({ message: 'This time slot is already booked' });

    const totalPrice = service.price;
    const booking = await Booking.create({
      client: req.user.id, provider: service.provider, service: serviceId,
      startTime: new Date(startTime), endTime: new Date(endTime),
      totalPrice, notes: notes || '', status: 'pending'
    });

    let paymentIntentId = '';
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'usd',
        metadata: { bookingId: booking._id.toString(), serviceId, providerId: service.provider.toString(), clientId: req.user.id },
        automatic_payment_methods: { enabled: true }
      });
      paymentIntentId = paymentIntent.id;
      booking.stripePaymentIntentId = paymentIntentId;
      await booking.save();
    } catch (stripeError) {
      console.error('Stripe error:', stripeError.message);
    }

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('service', 'title category price durationMinutes');

    res.status(201).json({ booking: populated, clientSecret: paymentIntentId ? `pi_${paymentIntentId}_secret` : null });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error creating booking' });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'pending') return res.status(400).json({ message: 'Only pending bookings can be confirmed' });
    booking.status = 'confirmed';
    await booking.save();
    res.json({ message: 'Booking confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming booking' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isClient = booking.client.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    if (!isClient && !isProvider) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status === 'completed' || booking.status === 'cancelled') return res.status(400).json({ message: 'Cannot cancel this booking' });
    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || '';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be completed' });
    booking.status = 'completed';
    await booking.save();
    res.json({ message: 'Booking completed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error completing booking' });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata?.bookingId;
    if (bookingId) {
      try {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed';
          await booking.save();
          console.log(`Booking ${bookingId} confirmed via Stripe payment`);
        }
      } catch (dbError) {
        console.error('Error updating booking after payment:', dbError);
      }
    }
  }
  res.json({ received: true });
};
