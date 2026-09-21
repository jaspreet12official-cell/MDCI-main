const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const imageController = require('../controllers/imageController');

// ✅ Fixed upload folder path (inside public so it's accessible)
const uploadFolder = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

// ✅ Route: handle image upload for logo (header/footer/banner)
router.post('/upload-image', upload.single('image'), imageController.uploadImage);

module.exports = router;
