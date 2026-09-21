// models/Image.js
const mongoose = require('mongoose');

const otherImageSchema = new mongoose.Schema({
  imagePath: String,
  section: {
    type: String,
    enum: ['placement', 'gallery', 'education', 'placementStudents' , 'MDCIGallery'], // differentiate
    required: true
  }
});

module.exports = mongoose.model('otherImage', otherImageSchema);
