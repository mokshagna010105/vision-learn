const Session = require('../models/Session');
const Keyword = require('../models/Keyword');
const Image = require('../models/Image');
const Log = require('../models/Log');
const nlpService = require('../services/nlpService');
const imageService = require('../services/imageService');
const whisperService = require('../services/whisperService');

/**
 * Helper to emit socket messages
 */
const emitToClassroom = (req, classroom, event, data) => {
  const io = req.app.get('io');
  if (io) {
    const roomName = classroom.toLowerCase().replace(/\s+/g, '-');
    io.to(roomName).emit(event, data);
    console.log(`Socket emit [${event}] to room [${roomName}]`);
  } else {
    console.warn('Socket.io instance not found on app context');
  }
};

/**
 * Helper to log API performance
 */
const logAPICall = async (endpoint, startTime, message, level = 'info') => {
  const duration = Date.now() - startTime;
  try {
    await Log.create({
      level,
      message,
      latencyMs: duration,
      apiEndpoint: endpoint
    });
  } catch (err) {
    console.error('Logging to DB failed:', err.message);
  }
};

/**
 * @desc    Start a listening session
 * @route   POST /api/sessions/start
 * @access  Private (Teacher)
 */
const startSession = async (req, res) => {
  const { subject, classroom, language } = req.body;
  const startTime = Date.now();

  if (!subject || !classroom) {
    return res.status(400).json({ message: 'Subject and Classroom are required' });
  }


  
  try {
    // End any active sessions in this classroom first
    await Session.updateMany({ classroom, isActive: true }, { isActive: false, endTime: Date.now() });

    const session = await Session.create({
      teacherId: req.user._id,
      subject,
      classroom,
      language: language || 'English',
      isActive: true,
      startTime: Date.now()
    });

    // Notify classroom display
    emitToClassroom(req, classroom, 'session-started', {
      sessionId: session._id,
      subject,
      language: session.language
    });

    await logAPICall('/api/sessions/start', startTime, `Started session ${session._id} for classroom ${classroom}`);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Stop a listening session
 * @route   POST /api/sessions/stop
 * @access  Private (Teacher)
 */
const stopSession = async (req, res) => {
  const { sessionId } = req.body;
  const startTime = Date.now();

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime.getTime()) / 1000); // duration in seconds

    session.isActive = false;
    session.endTime = endTime;
    session.duration = duration;
    await session.save();

    // Notify classroom display
    emitToClassroom(req, session.classroom, 'session-stopped', {
      sessionId: session._id,
      duration
    });

    await logAPICall('/api/sessions/stop', startTime, `Stopped session ${session._id}. Duration: ${duration}s`);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Process speech audio segment and return transcripts/keywords/images
 * @route   POST /api/sessions/speech
 * @access  Private (Teacher)
 */
const processSpeech = async (req, res) => {
  const startTime = Date.now();
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    // 1. Transcription (Whisper)
    const whisperStart = Date.now();
    const transcriptText = await whisperService.transcribeAudio(req.file.buffer, req.file.originalname);
    const whisperLatency = Date.now() - whisperStart;

    if (!transcriptText || transcriptText.trim().length === 0) {
      return res.json({ transcript: '', keywords: [], image: null });
    }

    // Save transcript chunk to Session model
    session.transcripts.push({ text: transcriptText, timestamp: new Date() });
    await session.save();

    // 2. Keyword Extraction (NLP)
    const nlpStart = Date.now();
    const extracted = nlpService.extractKeywords(transcriptText);
    const nlpLatency = Date.now() - nlpStart;

    // 3. Image Retrieval & Real-time push (Process the most relevant keyword)
    let processedKeyword = null;
    let selectedImage = null;

    if (extracted.length > 0) {
      // Pick the first/strongest keyword for image fetching
      const kwInfo = extracted[0];
      
      // Save Keyword to DB
      const kwDoc = await Keyword.create({
        sessionId: session._id,
        keyword: kwInfo.keyword,
        category: kwInfo.category
      });

      processedKeyword = kwDoc;

      // Search image (Unsplash/Pixabay/Google Custom Search -> fallback DALL-E)
      const imgSearchStart = Date.now();
      const imgResult = await imageService.getEducationalImage(kwInfo.keyword);
      const imgLatency = Date.now() - imgSearchStart;

      if (imgResult) {
        selectedImage = await Image.create({
          sessionId: session._id,
          keywordId: kwDoc._id,
          keyword: kwInfo.keyword,
          imageUrl: imgResult.url,
          source: imgResult.source
        });

        // Broadcast image event to classroom display in real time!
        emitToClassroom(req, session.classroom, 'new-image', {
          keyword: kwInfo.keyword,
          category: kwInfo.category,
          imageUrl: imgResult.url,
          source: imgResult.source,
          timestamp: selectedImage.createdAt
        });
      }
    }

    // Log the event with aggregate latencies
    const totalLatency = Date.now() - startTime;
    await logAPICall(
      '/api/sessions/speech',
      startTime,
      `Processed speech chunk: Whisper (${whisperLatency}ms), NLP (${nlpLatency}ms). Total (${totalLatency}ms)`
    );

    res.json({
      transcript: transcriptText,
      keyword: processedKeyword,
      image: selectedImage
    });
  } catch (error) {
    console.error('Process speech error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Extract keyword manually from text (Alternative speech path or manual trigger)
 * @route   POST /api/sessions/extract-keyword
 * @access  Private (Teacher)
 */
const extractKeywordFromText = async (req, res) => {
  const startTime = Date.now();
  const { sessionId, text } = req.body;

  if (!sessionId || !text) {
    return res.status(400).json({ message: 'Session ID and Text are required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(404).json({ message: 'Active session not found' });
    }

    const extracted = nlpService.extractKeywords(text);
    let selectedImage = null;
    let keywordDoc = null;

    if (extracted.length > 0) {
      const kwInfo = extracted[0];
      
      keywordDoc = await Keyword.create({
        sessionId: session._id,
        keyword: kwInfo.keyword,
        category: kwInfo.category
      });

      const imgResult = await imageService.getEducationalImage(kwInfo.keyword);
      if (imgResult) {
        selectedImage = await Image.create({
          sessionId: session._id,
          keywordId: keywordDoc._id,
          keyword: kwInfo.keyword,
          imageUrl: imgResult.url,
          source: imgResult.source
        });

        // Broadcast to classroom
        emitToClassroom(req, session.classroom, 'new-image', {
          keyword: kwInfo.keyword,
          category: kwInfo.category,
          imageUrl: imgResult.url,
          source: imgResult.source,
          timestamp: selectedImage.createdAt
        });
      }
    }
    

    await logAPICall('/api/sessions/extract-keyword', startTime, `Manual keyword extraction for "${text.substring(0, 30)}..."`);
    res.json({ keywords: extracted, image: selectedImage });
  } catch (error) {
    console.error('Extract keyword error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Search images using standard APIs
 * @route   GET /api/sessions/image
 * @access  Private (Teacher)
 */
const searchImage = async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: 'Keyword query param is required' });
  }

  try {
    const imgResult = await imageService.getEducationalImage(keyword);
    res.json(imgResult);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Generate fallback image using OpenAI DALL-E
 * @route   POST /api/sessions/generate-image
 * @access  Private (Teacher)
 */
const generateImage = async (req, res) => {
  const startTime = Date.now();
  const { keyword, sessionId } = req.body;

  if (!keyword || !sessionId) {
    return res.status(400).json({ message: 'Keyword and Session ID are required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const result = await imageService.generateDALLImage(keyword);
    
    if (!result) {
      return res.status(500).json({ message: 'Failed to generate AI image. Check API key.' });
    }

    const keywordDoc = await Keyword.create({
      sessionId: session._id,
      keyword: keyword,
      category: 'AI Generated'
    });

    const imageDoc = await Image.create({
      sessionId: session._id,
      keywordId: keywordDoc._id,
      keyword: keyword,
      imageUrl: result.url,
      source: 'DALL-E'
    });

    // Broadcast to classroom
    emitToClassroom(req, session.classroom, 'new-image', {
      keyword: keyword,
      category: 'AI Generated',
      imageUrl: result.url,
      source: 'DALL-E',
      timestamp: imageDoc.createdAt
    });

    await logAPICall('/api/sessions/generate-image', startTime, `Generated DALL-E image for "${keyword}"`);
    res.json(imageDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Manually override an image URL for the classroom display
 * @route   POST /api/sessions/override-image
 * @access  Private (Teacher)
 */
const overrideImage = async (req, res) => {
  const { sessionId, keyword, imageUrl } = req.body;

  if (!sessionId || !keyword || !imageUrl) {
    return res.status(400).json({ message: 'Session ID, Keyword, and Image URL are required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const imageDoc = await Image.create({
      sessionId: session._id,
      keyword: keyword,
      imageUrl: imageUrl,
      source: 'Override',
      isOverride: true
    });

    // Broadcast to classroom
    emitToClassroom(req, session.classroom, 'new-image', {
      keyword: keyword,
      category: 'Teacher Override',
      imageUrl: imageUrl,
      source: 'Override',
      timestamp: imageDoc.createdAt
    });

    res.json(imageDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Remove currently displayed image from the classroom display
 * @route   DELETE /api/sessions/remove-image
 * @access  Private (Teacher)
 */
const removeImage = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Session ID is required' });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update DB
    await Image.updateMany({ sessionId, isRemoved: false }, { isRemoved: true });

    // Broadcast clear event to classroom
    emitToClassroom(req, session.classroom, 'clear-image', {
      sessionId: session._id
    });

    res.json({ message: 'Image removed from screen successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get session history
 * @route   GET /api/history
 * @access  Private
 */
const getHistory = async (req, res) => {
  const { subject, language, teacherId, date } = req.query;
  const filter = {};

  if (subject) filter.subject = subject;
  if (language) filter.language = language;
  if (teacherId) filter.teacherId = teacherId;
  
  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  try {
    const sessions = await Session.find(filter)
      .populate('teacherId', 'name email')
      .sort({ startTime: -1 });

    const populatedSessions = await Promise.all(sessions.map(async (sess) => {
      const keywords = await Keyword.find({ sessionId: sess._id });
      const images = await Image.find({ sessionId: sess._id });
      return {
        ...sess.toObject(),
        keywords,
        images
      };
    }));

    res.json(populatedSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startSession,
  stopSession,
  processSpeech,
  extractKeywordFromText,
  searchImage,
  generateImage,
  overrideImage,
  removeImage,
  getHistory
};
