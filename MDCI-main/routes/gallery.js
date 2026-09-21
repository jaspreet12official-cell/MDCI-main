const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const multer = require('multer');
const path = require('path');

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/gallery'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to upload gallery images
router.post('/upload-gallery', upload.array('image', 10), galleryController.uploadGalleryImages);

// Route to delete image
router.post('/delete-gallery-image/:id', galleryController.deleteGalleryImage);

module.exports = router;
