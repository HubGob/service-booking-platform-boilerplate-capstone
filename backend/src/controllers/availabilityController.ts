import { Request, Response } from 'express';
import mongoose from 'mongoose';

interface AvailabilityQuery {
  provider?: string;
}

export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider } = req.query as AvailabilityQuery;
    if (!provider) {
      res.status(400).json({ message: 'Provider ID is required' });
      return;
    }
    const slots = await mongoose.model('Availability')
      .find({ provider, isActive: true })
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ availability: slots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

export const getProviderAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const slots = await mongoose.model('Availability')
      .find({ provider: req.params.id, isActive: true })
      .sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ availability: slots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

export const createAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as any).user.role !== 'provider') {
      res.status(403).json({ message: 'Only providers can set availability' });
      return;
    }
    const slot = await mongoose.model('Availability').create({ ...req.body, provider: (req as any).user.id });
    res.status(201).json(slot);
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({ message: (error as any).message });
      return;
    }
    res.status(500).json({ message: 'Error creating availability' });
  }
};

export const updateAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const slot = await mongoose.model('Availability').findById(req.params.id);
    if (!slot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }
    if (slot.provider.toString() !== (req as any).user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const updated = await mongoose.model('Availability').findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({ message: (error as any).message });
      return;
    }
    res.status(500).json({ message: 'Error updating availability' });
  }
};

export const deleteAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const slot = await mongoose.model('Availability').findById(req.params.id);
    if (!slot) {
      res.status(404).json({ message: 'Slot not found' });
      return;
    }
    if (slot.provider.toString() !== (req as any).user.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    await mongoose.model('Availability').findByIdAndDelete(req.params.id);
    res.json({ message: 'Availability slot deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability' });
  }
};