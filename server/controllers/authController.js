const User = require('../models/User');
const Subject = require('../models/Subject');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'studytrack_super_secret_jwt_key_2026_xyz987!',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      xp: 50, // Starter bonus XP
      level: 1,
      streak: 1,
      targetDailyHours: 4,
      lastStudyDate: new Date(),
    });

    // Seed default subjects for nice first-time experience
    try {
      await Subject.create([
        {
          user: user._id,
          name: 'Computer Science & AI',
          color: '#6366f1', // Indigo neon
          weeklyTargetHours: 8,
          description: 'Algorithms, Data Structures & Machine Learning',
        },
        {
          user: user._id,
          name: 'Full Stack Web Dev',
          color: '#06b6d4', // Cyan neon
          weeklyTargetHours: 10,
          description: 'React, Node, Express, MongoDB & Tailwind',
        },
        {
          user: user._id,
          name: 'Mathematics & Logic',
          color: '#ec4899', // Pink neon
          weeklyTargetHours: 5,
          description: 'Discrete Math, Linear Algebra & Probability',
        },
      ]);
    } catch (subjErr) {
      console.warn('Subject seeding note:', subjErr.message);
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        targetDailyHours: user.targetDailyHours,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check & calculate streak
    const now = new Date();
    const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    if (lastDate) {
      const diffTime = Math.abs(now - lastDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
      user.lastStudyDate = now;
      await user.save();
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        targetDailyHours: user.targetDailyHours,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile & goals
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, targetDailyHours, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (targetDailyHours !== undefined) user.targetDailyHours = Number(targetDailyHours);
    if (avatar) user.avatar = avatar;

    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        targetDailyHours: user.targetDailyHours,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};
