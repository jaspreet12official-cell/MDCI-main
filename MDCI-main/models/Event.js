const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  eventImage: { type: String },
  eventDate: { type: Date, required: true },
  email: { type: String },
  website: { type: String },
  organiser: { type: String },
  mapLocation: { type: String },

  // ✨ New dynamic editable fields
  content: { type: String },
  details: { type: String },
  venue: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
