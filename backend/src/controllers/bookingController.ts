import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { Booking } from '../models/Booking';
import Stripe from 'stripe';

const stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2023-10-16' });

interface TimeSlot {
  providerId: string;
  startTime: Date;
  endTime: Date;
  excludeBookingId?: string;
}

const hasConflict = async ({
  providerId,
  startTime,
  endTime,
  excludeBookingId,
}: TimeSlot): Promise<boolean> => {
  const query: any = {
    provider: providerId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return (await Booking.countDocuments(query)) > 0;
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    let query: any = {};
    const user = (req as any).user;
    if (user.role === 'client') query.client = user.id;
    else if (user.role === 'provider') query.provider = user.id;
    else {
      res.status(403).json({ message: 'Unknown role' });
      return;
    }

    const { status, page = '1', limit = '20' } = req.query;
    if (status) query.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('client', 'name email avatar')
        .populate('provider', 'name email avatar')
        .populate('service', 'title category price durationMinutes')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.json({
      bookings,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const getBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('service', 'title category price durationMinutes');
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    const userId = (req as any).user.id;
    if (booking.client._id.toString() !== userId && booking.provider._id.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'client') {
      res.status(403).json({ message: 'Only clients can create bookings' });
      return;
    }

    const { serviceId, startTime, endTime, notes } = req.body as {
      serviceId: string;
      startTime: string;
      endTime: string;
      notes?: string;
    };

    const service = await Service.findById(serviceId);
    if (!service || !service.isActive) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }

    const conflict = await hasConflict({
      providerId: service.provider.toString(),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
    if (conflict) {
      res.status(409).json({ message: 'This time slot is already booked' });
      return;
    }

    const totalPrice = service.price;
    const booking = await Booking.create({
      client: (req as any).user.id,
      provider: service.provider,
      service: serviceId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalPrice,
      notes: notes || '',
      status: 'pending',
    });

    let paymentIntentId = '';
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: 'usd',
        metadata: {
          bookingId: booking._id.toString(),
          serviceId,
          providerId: service.provider.toString(),
          clientId: (req as any).user.id,
        },
        automatic_payment_methods: { enabled: true },
      });
      paymentIntentId = paymentIntent.id;
      booking.stripePaymentIntentId = paymentIntentId;
      await booking.save();
    } catch (stripeError) {
      console.error('Stripe error:', (stripeError as Error).message);
    }

    const populated = await Booking.findById(booking._id)
      .populate('client', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('service', 'title category price durationMinutes');

    res.status(201).json({
      booking: populated,
      clientSecret: paymentIntentId ? `pi_${paymentIntentId}_secret` : null,
    });
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({ message: (error as any).message });
      return;
    }
    res.status(500).json({ message: 'Error creating booking' });
  }
};

export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.provider.toString() !== (req as any).user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    if (booking.status !== 'pending') {
      res.status(400).json({ message: 'Only pending bookings can be confirmed' });
      return;
    }
    booking.status = 'confirmed';
    await booking.save();
    res.json({ message: 'Booking confirmed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error confirming booking' });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    const isClient = booking.client.toString() === (req as any).user.id;
    const isProvider = booking.provider.toString() === (req as any).user.id;
    if (!isClient && !isProvider) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      res.status(400).json({ message: 'Cannot cancel this booking' });
      return;
    }
    booking.status = 'cancelled';
    booking.cancellationReason = (req.body as any).reason || '';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

export const completeBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.provider.toString() !== (req as any).user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    if (booking.status !== 'confirmed') {
      res.status(400).json({ message: 'Only confirmed bookings can be completed' });
      return;
    }
    booking.status = 'completed';
    await booking.save();
    res.json({ message: 'Booking completed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error completing booking' });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message);
    res.status(400).json({ message: `Webhook Error: ${(err as Error).message}` });
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
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