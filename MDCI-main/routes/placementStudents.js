const express = require('express');
const router = express.Router();
const placementStudentsController = require('../controllers/placementStudentsController');
const multer = require('multer');
const path = require('path');

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/placementStudents'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route to upload placementStudents images
router.post('/upload-placementStudents-images', upload.array('images', 10), placementStudentsController.uploadplacementStudentsImages);

// Route to delete image
router.post('/delete-placementStudents-image/:id', placementStudentsController.deleteplacementStudentsImage);

module.exports = router;
