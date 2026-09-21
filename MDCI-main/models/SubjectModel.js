const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjectCode: { type: String, required: true }, // ✅ Added
  description: { type: String },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Subject", subjectSchema);
