const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: 0
  },
  stripePaymentIntentId: { type: String, default: '' },
  stripeSessionID: { type: String, default: '' },
  notes: { type: String, maxlength: 1000, default: '' },
  cancellationReason: { type: String, maxlength: 500, default: '' },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
