import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: { id: string; role: 'client' | 'provider' };
}

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body as {
      email: string;
      password: string;
      name: string;
      role?: string;
    };
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Email, password, and name are required' });
      return;
    }
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    const user = await User.create({ email, password, name, role: role || 'client' });
    const accessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' }
    );
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    await user.save();
    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      accessToken, refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const accessToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' }
    );
    user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    await user.save();
    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, name: user.name, role: user.role, bio: user.bio, specialty: user.specialty, hourlyRate: user.hourlyRate },
      accessToken, refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }
    let decoded: { userId: string; role: string };
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string; role: string };
    } catch {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    const storedToken = user.refreshTokens.find((rt: any) => rt.token === refreshToken);
    if (!storedToken) {
      res.status(401).json({ message: 'Refresh token not recognized' });
      return;
    }
    if (storedToken.expiresAt < new Date()) {
      user.refreshTokens = user.refreshTokens.filter((rt: any) => rt.expiresAt > new Date());
      await user.save();
      res.status(401).json({ message: 'Refresh token expired' });
      return;
    }
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '30d' }
    );
    user.refreshTokens = user.refreshTokens.filter((rt: any) => rt.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    await user.save();
    res.json({ accessToken: jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' }), refreshToken: newRefreshToken });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((rt: any) => rt.token !== refreshToken);
          await user.save();
        }
      } catch { /* invalid token */ }
    }
    res.json({ message: 'Logout successful' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      id: user._id, email: user.email, name: user.name, role: user.role,
      bio: user.bio, specialty: user.specialty, hourlyRate: user.hourlyRate, avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  }
};