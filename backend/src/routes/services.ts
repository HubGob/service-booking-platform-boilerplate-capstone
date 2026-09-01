import { Router } from 'express';
import { getServices, getService, createService, updateService, deleteService } from '../controllers/serviceController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getServices);
router.get('/:id', getService);
router.post('/', auth, requireRole('provider') as any, createService);
router.put('/:id', auth, requireRole('provider') as any, updateService);
router.delete('/:id', auth, requireRole('provider') as any, deleteService);

export default router;