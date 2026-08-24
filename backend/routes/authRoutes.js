const express = require('express');
const { loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/login', loginUser);

router.post('/logout', (req, res) => {
  // Client handles token discard, backend just returns a confirmation status
  res.json({ message: 'Logged out successfully' });
});

router.get('/profile', protect, getUserProfile);

module.exports = router;
