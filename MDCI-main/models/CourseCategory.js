const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: String,
  icon: String
});

module.exports = mongoose.model("CourseCategory", categorySchema);
