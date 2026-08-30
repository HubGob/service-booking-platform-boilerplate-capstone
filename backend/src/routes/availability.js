const express = require('express');
const { getAvailability, getProviderAvailability, createAvailability, updateAvailability, deleteAvailability } = require('../controllers/availabilityController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAvailability);
router.get('/provider/:id', getProviderAvailability);
router.post('/', auth, requireRole('provider'), createAvailability);
router.put('/:id', auth, requireRole('provider'), updateAvailability);
router.delete('/:id', auth, requireRole('provider'), deleteAvailability);

module.exports = router;
