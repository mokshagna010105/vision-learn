const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforvisionlearnclassrooms12345', {
    expiresIn: '30d'
  });
};



/**
 * @desc    Authenticate teacher or admin & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // 1. Search in Admins
    let user = await Admin.findOne({ email });
    let role = 'admin';

    // 2. Search in Teachers if not Admin
    if (!user) {
      user = await Teacher.findOne({ email });
      role = 'teacher';
    }

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        subject: user.subject || undefined,
        classrooms: user.classrooms || undefined,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.userRole,
      subject: req.user.subject,
      classrooms: req.user.classrooms
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  loginUser,
  getUserProfile
};
