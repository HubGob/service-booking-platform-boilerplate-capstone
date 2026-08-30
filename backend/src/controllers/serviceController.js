const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const { category, provider, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (provider) query.provider = provider;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [services, total] = await Promise.all([
      Service.find(query)
        .populate('provider', 'name avatar specialty hourlyRate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Service.countDocuments(query)
    ]);

    res.json({
      services,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services' });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar bio specialty hourlyRate');
    if (!service || !service.isActive) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service' });
  }
};

exports.createService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Only providers can create services' });

    const service = await Service.create({ ...req.body, provider: req.user.id });
    const populated = await Service.findById(service._id)
      .populate('provider', 'name avatar specialty hourlyRate');
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error creating service' });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('provider', 'name avatar specialty hourlyRate');
    res.json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error updating service' });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    service.isActive = false;
    await service.save();
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service' });
  }
};
