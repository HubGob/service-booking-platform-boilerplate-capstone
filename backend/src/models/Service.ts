import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IServiceDocument extends Document {
  provider: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const Service = mongoose.model<IServiceDocument>('Service', new Schema<IServiceDocument>({
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['tutoring', 'consulting', 'design', 'writing', 'development', 'marketing', 'music', 'other'],
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Minimum 15 minutes'],
    max: [480, 'Maximum 8 hours'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1'],
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}));

Service.schema.index({ provider: 1, isActive: 1 });
Service.schema.index({ category: 1, isActive: 1 });

Service.schema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});