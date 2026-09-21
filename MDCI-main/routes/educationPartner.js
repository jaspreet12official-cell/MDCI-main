const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const multer = require('multer');
const path = require('path');

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/education'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to upload education images
router.post('/upload-education-images', upload.array('images', 10), educationController.uploadeducationImages);

// Route to delete image
router.post('/delete-education-image/:id', educationController.deleteeducationImage);

module.exports = router;
