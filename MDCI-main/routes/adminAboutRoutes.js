const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AboutMedia = require('../models/AboutMedia'); // Mongoose model

// Define upload directory path
const uploadDir = path.join(__dirname, '../uploads/aboutSection');

// Ensure the directory exists
fs.mkdirSync(uploadDir, { recursive: true });

// Multer config for storing image in uploads/aboutSection
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the full path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Handle POST request
router.post('/upload-aboutMedia', upload.single('image'), async (req, res) => {
  try {
    const { section, name, videoUrl } = req.body;
    let imagePath = null;

    if (name === 'Image' && req.file) {
      imagePath = `/uploads/aboutSection/${req.file.filename}`;
    }

    // Check validation: one must be provided
    if (name === 'Image' && !imagePath) {
      return res.status(400).send('Please upload an image.');
    }

    if (name === 'Video Link' && !videoUrl) {
      return res.status(400).send('Please enter a video URL.');
    }

    // Remove any existing media in the same section
    await AboutMedia.deleteMany({ section });

    const media = new AboutMedia({
      section,
      name,
      imagePath: name === 'Image' ? imagePath : null,
      videoUrl: name === 'Video Link' ? videoUrl : null
    });

    await media.save();
    res.redirect('/admin-aboutUs');
  } catch (err) {
        next(err)

  }
});


module.exports = router;
