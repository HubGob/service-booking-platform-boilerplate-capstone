const Availability = require('../models/Availability');

exports.getAvailability = async (req, res) => {
  try {
    const { provider } = req.query;
    if (!provider) return res.status(400).json({ message: 'Provider ID is required' });
    const slots = await Availability.find({ provider, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ availability: slots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

exports.getProviderAvailability = async (req, res) => {
  try {
    const slots = await Availability.find({ provider: req.params.id, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ availability: slots });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

exports.createAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'provider') return res.status(403).json({ message: 'Only providers can set availability' });
    const slot = await Availability.create({ ...req.body, provider: req.user.id });
    res.status(201).json(slot);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error creating availability' });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const updated = await Availability.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Error updating availability' });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.provider.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await Availability.findByIdAndDelete(req.params.id);
    res.json({ message: 'Availability slot deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability' });
  }
};
