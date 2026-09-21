// models/BannerInquiry.js
const mongoose = require("mongoose");

const bannerInquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  courseChoice: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("BannerInquiry", bannerInquirySchema);
