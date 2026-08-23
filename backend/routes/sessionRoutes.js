const express = require('express');
const multer = require('multer');
const { 
  startSession, 
  stopSession, 
  processSpeech, 
  extractKeywordFromText, 
  searchImage, 
  generateImage, 
  overrideImage, 
  removeImage, 
  getHistory 
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/start-session', protect, startSession);
router.post('/stop-session', protect, stopSession);
router.post('/speech', protect, upload.single('audio'), processSpeech);
router.post('/extract-keyword', protect, extractKeywordFromText);
router.get('/image', protect, searchImage);
router.post('/generate-image', protect, generateImage);
router.post('/override-image', protect, overrideImage);
router.delete('/remove-image', protect, removeImage);
router.get('/history', protect, getHistory);

module.exports = router;
