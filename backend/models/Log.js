const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  latencyMs: {
    type: Number
  },
  apiEndpoint: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', LogSchema);
