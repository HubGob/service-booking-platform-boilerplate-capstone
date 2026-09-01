import { Request, Response } from 'express';
import { Service } from '../models/Service';

interface AuthRequest extends Request {
  user?: { id: string; role: 'client' | 'provider' };
}

export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, provider, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const query: any = { isActive: true };
    if (category) query.category = category;
    if (provider) query.provider = provider;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('provider', 'name avatar specialty hourlyRate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Service.countDocuments(query),
    ]);

    res.json({
      services,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services' });
  }
};

export const getService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name avatar bio specialty hourlyRate');
    if (!service || !service.isActive) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service' });
  }
};

export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    if ((req as AuthRequest).user?.role !== 'provider') {
      res.status(403).json({ message: 'Only providers can create services' });
      return;
    }

    const service = await Service.create({ ...req.body, provider: (req as AuthRequest).user!.id });
    const populated = await Service.findById(service._id).populate('provider', 'name avatar specialty hourlyRate');
    res.status(201).json(populated);
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({ message: (error as any).message });
      return;
    }
    res.status(500).json({ message: 'Error creating service' });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    if (service.provider.toString() !== (req as AuthRequest).user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'name avatar specialty hourlyRate');
    res.json(updated);
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({ message: (error as any).message });
      return;
    }
    res.status(500).json({ message: 'Error updating service' });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    if (service.provider.toString() !== (req as AuthRequest).user!.id) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    service.isActive = false;
    await service.save();
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service' });
  }
};