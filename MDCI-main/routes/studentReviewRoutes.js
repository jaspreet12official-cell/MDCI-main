const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentReviewController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const protect = require("../middleware/authMiddleware");



const uploadDir = path.join(__dirname, '../public/uploads/reviews');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/reviews'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.get('/student-reviews',protect, controller.getStudentReviews);
router.post('/add-student-review', upload.single('image'), controller.addStudentReview);
router.post('/delete-student-review/:id', controller.deleteStudentReview);

module.exports = router;
