const Teacher = require('../models/Teacher');
const Session = require('../models/Session');
const Keyword = require('../models/Keyword');
const Image = require('../models/Image');
const Log = require('../models/Log');


/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private/Admin
 */
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}).select('-password').sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new teacher account
 * @route   POST /api/teachers
 * @access  Private/Admin
 */
const createTeacher = async (req, res) => {
  const { name, email, password, subject, classrooms } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Teacher with this email already exists' });
    }

    const teacher = await Teacher.create({
      name,
      email,
      password,
      subject: subject || 'General',
      classrooms: classrooms || ['Classroom A', 'Classroom B']
    });

    res.status(201).json({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      classrooms: teacher.classrooms,
      createdAt: teacher.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a teacher account
 * @route   DELETE /api/teachers/:id
 * @access  Private/Admin
 */
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get analytics report
 * @route   GET /api/analytics
 * @access  Private (Admin & IT Support)
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Total counts
    const totalTeachers = await Teacher.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalKeywords = await Keyword.countDocuments();
    const totalImages = await Image.countDocuments();

    // 2. Top searched keywords (group by keyword)
    const topKeywords = await Keyword.aggregate([
      { $group: { _id: { $toLower: '$keyword' }, count: { $sum: 1 }, original: { $first: '$keyword' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 3. Average response time (from logs or mock tracking)
    const latencyStats = await Log.aggregate([
      { $match: { latencyMs: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgLatency: { $avg: '$latencyMs' } } }
    ]);
    const avgLatency = latencyStats.length > 0 ? Math.round(latencyStats[0].avgLatency) : 1250; // Fallback to 1.25s if empty

    // 4. Daily sessions (last 7 days)
    const dailySessions = await Session.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    // 5. API Usage counts (by endpoint / logs)
    const whisperCalls = await Log.countDocuments({ apiEndpoint: '/api/sessions/speech' });
    const imageRetrievalCalls = await Log.countDocuments({ apiEndpoint: '/api/sessions/image' });
    const imageGenCalls = await Log.countDocuments({ apiEndpoint: '/api/sessions/generate-image' });

    // 6. System health mock/live status (IT monitoring)
    const apiHealth = {
      whisper: process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_') ? 'online' : 'degraded',
      pixabay: process.env.PIXABAY_API_KEY && !process.env.PIXABAY_API_KEY.includes('your_') ? 'online' : 'offline',
      unsplash: process.env.UNSPLASH_ACCESS_KEY && !process.env.UNSPLASH_ACCESS_KEY.includes('your_') ? 'online' : 'offline',
      googleSearch: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY && !process.env.GOOGLE_CUSTOM_SEARCH_API_KEY.includes('your_') ? 'online' : 'offline',
      mongodb: 'online'
    };

    res.json({
      summary: {
        totalTeachers,
        totalSessions,
        totalKeywords,
        totalImages,
        avgLatency
      },
      topKeywords: topKeywords.map(k => ({ keyword: k.original, count: k.count })),
      dailySessions: dailySessions.map(d => ({ date: d._id, count: d.count })),
      apiUsage: {
        whisper: whisperCalls || 0,
        imageSearch: imageRetrievalCalls || 0,
        imageGeneration: imageGenCalls || 0
      },
      apiHealth
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get system logs
 * @route   GET /api/admin/logs
 * @access  Private (Admin & IT Support)
 */
const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  deleteTeacher,
  getAnalytics,
  getLogs
};
