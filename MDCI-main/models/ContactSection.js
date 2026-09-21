const mongoose = require('mongoose');

const contactItemSchema = new mongoose.Schema({
  name: String,
  heading: String,
  content: String,
  imagePath: String
});



module.exports = mongoose.model('ContactSection', contactItemSchema);
