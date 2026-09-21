const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  section: String, // e.g. 'homepage'
  html: String,
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
