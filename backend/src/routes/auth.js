const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

const validate = (validations) => async (req, res, next) => {
  for (const v of validations) await v.run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

router.post('/register', validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
]), register);

router.post('/login', validate([
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
]), login);

router.post('/refresh', validate([body('refreshToken').notEmpty()]), refreshToken);
router.post('/logout', logout);
router.get('/me', auth, getMe);

module.exports = router;
