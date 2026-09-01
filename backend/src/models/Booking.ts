import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IBookingDocument extends Document {
  client: Types.ObjectId;
  provider: Types.ObjectId;
  service: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  stripePaymentIntentId: string;
  stripeSessionID: string;
  notes: string;
  cancellationReason: string;
  createdAt: Date;
}

export const Booking = mongoose.model<IBookingDocument>('Booking', new Schema<IBookingDocument>({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
    index: true,
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true,
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0,
  },
  stripePaymentIntentId: { type: String, default: '' },
  stripeSessionID: { type: String, default: '' },
  notes: { type: String, maxlength: 1000, default: '' },
  cancellationReason: { type: String, maxlength: 500, default: '' },
  createdAt: { type: Date, default: Date.now },
}));

Booking.schema.index({ client: 1, status: 1 });
Booking.schema.index({ provider: 1, status: 1 });
Booking.schema.index({ startTime: 1, endTime: 1 });