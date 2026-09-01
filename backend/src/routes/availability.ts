import { Router } from 'express';
import { getAvailability, getProviderAvailability, createAvailability, updateAvailability, deleteAvailability } from '../controllers/availabilityController';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', getAvailability);
router.get('/:id', getProviderAvailability);
router.post('/', auth, createAvailability);
router.put('/:id', auth, updateAvailability);
router.delete('/:id', auth, deleteAvailability);

export default router;