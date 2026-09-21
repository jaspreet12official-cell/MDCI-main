const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  fees: { type: Number, required: true },
  courseImage: { type: String },
  pdf: { type: String },
  topicCoverContent: { type: String },

  topics: [topicSchema],

  // ✅ Reference to Subject documents
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],

  category: { type: String, required: true },

  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
