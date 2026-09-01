import mongoose, { Schema, Document, Types, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  role: 'client' | 'provider';
  name: string;
  avatar: string;
  bio: string;
  specialty: string;
  hourlyRate: number;
  refreshTokens: Array<{ token: string; expiresAt: Date }>;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  // Override to ensure we get back IUserDocument instances
}

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['client', 'provider'],
    default: 'client',
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  specialty: { type: String, trim: true, default: '' },
  hourlyRate: { type: Number, min: 0, default: 0 },
  refreshTokens: [{
    token: { type: String },
    expiresAt: { type: Date },
  }],
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUserDocument>('User', userSchema);