import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, refreshToken, logout, getMe } from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = Router();

const validate = (validations: ReturnType<typeof body>[]) => async (req: Request, res: Response, next: () => void): Promise<void> => {
  for (const v of validations) await v.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return;
  }
  next();
};

router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ]),
  register
);

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  login
);

router.post('/refresh', validate([body('refreshToken').notEmpty()]), refreshToken);
router.post('/logout', logout);
router.get('/me', auth, getMe);

export default router;