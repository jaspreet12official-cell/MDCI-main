const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  enrolled: {
    type: Number,
    default: 0,
  },
  image: String, // ✅ added image field

  location: {
    type: String,
  },
  stablishedYear: {
    type: Number,
  },
  timingContent: {
    type: String,
  },
  briefContent: {
    type: String,
  },
  aboutContent: {
    type: String,
  },
  metaTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  metaKeyword: {
    type: String,
  },
  placementPartnerImages: [
    {
      type: String, // store image URLs or paths
    },
  ],
  gallery: [
    {
      type: String, // store image URLs or paths
    },
  ],
  courses: [
    {
      offeredCourseText: String,
      viewLink: String,
      course: {
        name: String,
        image: String,
        duration: String,
      },
    },
  ],
  reviews: [
    {
      reviewText: String,
      review: {
        name: String,
        rating: Number,
        review: String,
        image: String,
      },
    },
  ],
});

module.exports = mongoose.model("University", universitySchema);
