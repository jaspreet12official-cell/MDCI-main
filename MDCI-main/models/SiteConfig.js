const mongoose = require("mongoose");

const siteConfigSchema = new mongoose.Schema({
  headerImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
  footerImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
  bannerImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
  siteName: String,
  logo: String,
});

module.exports = mongoose.model("SiteConfig", siteConfigSchema);
