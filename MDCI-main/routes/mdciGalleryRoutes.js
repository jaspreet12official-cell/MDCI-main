const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mdciGalleryController = require("../controllers/mdciGalleryController");
const protect = require("../middleware/authMiddleware");


// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/mdciGallery");

    // Check if directory exists, if not create it
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
router.get("/admin-gallery",protect, mdciGalleryController.getMdciGallery);
router.post("/admin-gallery", upload.array("image", 10), mdciGalleryController.uploadMdciGalleryImages);
router.post("/delete-admin-image/:id", mdciGalleryController.deleteMdciGalleryImage);

module.exports = router;
