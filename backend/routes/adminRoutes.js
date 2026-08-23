const express = require('express');
const { 
  getTeachers, 
  createTeacher, 
  deleteTeacher, 
  getAnalytics, 
  getLogs 
} = require('../controllers/adminController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/teachers')
  .get(protect, adminProtect, getTeachers)
  .post(protect, adminProtect, createTeacher);

router.delete('/teachers/:id', protect, adminProtect, deleteTeacher);

router.get('/analytics', protect, getAnalytics);
router.get('/logs', protect, adminProtect, getLogs);

module.exports = router;
