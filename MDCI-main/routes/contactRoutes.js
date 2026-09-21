const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/contact");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Optional: Validate image type
const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    return cb(new Error("Only image files are allowed!"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Routes
router.get("/admin-contact", protect, contactController.getAdminContactSection);
router.get("/contact", contactController.getContactSection);

router.post(
  "/admin-contact",
  upload.fields([
    { name: "image0", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ]),
  contactController.postContactSection
);

module.exports = router;
