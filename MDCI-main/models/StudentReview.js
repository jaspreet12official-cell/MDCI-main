const mongoose = require('mongoose');

const studentReviewSchema = new mongoose.Schema({
  name: String,
  position: String,
  imagePath: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
});

module.exports = mongoose.model('StudentReview', studentReviewSchema);
