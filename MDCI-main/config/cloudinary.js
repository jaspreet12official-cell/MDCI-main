// cloudinary.js
require("dotenv").config();
const { v2: cloudinary } = require("cloudinary");

// Validate required envs early (useful on Render where .env files aren't read)
["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"].forEach((k) => {
  if (!process.env[k]) {
    throw new Error(`Missing environment variable: ${k}`);
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,          // ensure https URLs
  timeout: 60000         // 60s request timeout
  // uploadTimeout can be set per-upload if needed
});

module.exports = cloudinary;
