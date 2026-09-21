const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  issueDate: Date,
  center: String,
  branchName: String,
  examMonth: String, // Example: "March"
  examYear: Number, // Example: 2025
  courseCompletionDate: Date,
  certificateNo: String,
  marks: [
    {
      subjectCode: String,
      subjectName: String,
      minMarks: Number,
      maxMarks: Number,
      theoryMarks: Number,
      practicalMarks: Number,
    },
  ],
});

module.exports = mongoose.model("Marks", marksSchema);
