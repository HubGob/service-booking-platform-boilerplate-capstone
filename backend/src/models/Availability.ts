import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IAvailabilityDocument extends Document {
  provider: Types.ObjectId;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export const Availability = mongoose.model<IAvailabilityDocument>('Availability', new Schema<IAvailabilityDocument>({
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true,
  },
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week is required'],
    min: [0, '0 = Sunday'],
    max: [6, '6 = Saturday'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format (24h)'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format (24h)'],
  },
  isActive: { type: Boolean, default: true },
}));

Availability.schema.index({ provider: 1, dayOfWeek: 1, isActive: 1 });

Availability.schema.pre('validate', function (next) {
  if ((this as IAvailabilityDocument).startTime >= (this as IAvailabilityDocument).endTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});