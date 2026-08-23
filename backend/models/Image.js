const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  keywordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Keyword'
  },
  keyword: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['Google', 'Pixabay', 'Unsplash', 'DALL-E', 'Override'],
    default: 'Unsplash'
  },
  isOverride: {
    type: Boolean,
    default: false
  },
  isRemoved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Image', ImageSchema);
