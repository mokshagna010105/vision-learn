const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;
  
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforvisionlearnclassrooms12345');
      
      // Try finding user in Teachers collection first
      let user = await Teacher.findById(decoded.id).select('-password');
      let role = 'teacher';
      
      // If not a teacher, search in Admins
      if (!user) {
        user = await Admin.findById(decoded.id).select('-password');
        role = 'admin';
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user = user;
      req.userRole = role;
      next();
    } catch (error) {
      console.error('Auth check error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminProtect = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin role required' });
  }
};

module.exports = { protect, adminProtect };
