const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: false, // Make publicId optional
  },
  url: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
