const express = require('express');
const { getServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getService);
router.post('/', auth, requireRole('provider'), createService);
router.put('/:id', auth, requireRole('provider'), updateService);
router.delete('/:id', auth, requireRole('provider'), deleteService);

module.exports = router;
