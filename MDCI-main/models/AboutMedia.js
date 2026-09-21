const mongoose = require('mongoose');

const AboutMediaSchema = new mongoose.Schema({
  // “top” or “bottom” determines where the media shows up
  section: {
    type: String,
    enum: ['top', 'bottom'],
    required: true,
    default: 'top'
  },
  imagePath: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  name: {
    type: String,
    enum: ['Image', 'Video Link'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AboutMedia', AboutMediaSchema);
