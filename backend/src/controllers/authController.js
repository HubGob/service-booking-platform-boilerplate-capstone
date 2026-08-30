const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ email, password, name, role: role || 'client' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      accessToken, refreshToken
    });
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, name: user.name, role: user.role, bio: user.bio, specialty: user.specialty, hourlyRate: user.hourlyRate },
      accessToken, refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    let decoded;
    try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
    catch (e) { return res.status(401).json({ message: 'Invalid refresh token' }); }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const storedToken = user.refreshTokens.find(rt => rt.token === refreshToken);
    if (!storedToken) return res.status(401).json({ message: 'Refresh token not recognized' });

    if (storedToken.expiresAt < new Date()) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.expiresAt > new Date());
      await user.save();
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.json({ accessToken: generateAccessToken(user), refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
          await user.save();
        }
      } catch (e) { /* invalid token, ignore */ }
    }
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id, email: user.email, name: user.name, role: user.role,
      bio: user.bio, specialty: user.specialty, hourlyRate: user.hourlyRate, avatar: user.avatar,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
