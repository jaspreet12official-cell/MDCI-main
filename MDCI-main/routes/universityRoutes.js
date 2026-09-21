const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const universityController = require("../controllers/universityController");
const protect = require("../middleware/authMiddleware");

// Multer setup with folder check
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "./uploads/universities";

    // Create folder if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// University routes
router.get("/universities", protect, universityController.getUniversities);
router.post("/add-university", upload.single("image"), universityController.postAddUniversity);
router.get("/edit-university/:id", protect, universityController.getEditUniversity);
router.post("/edit-university/:id", upload.single("image"), universityController.postEditUniversity);
router.post("/delete-university/:id", universityController.deleteUniversity);

// Gallery routes
router.get("/university/:id/gallery", protect, universityController.getGalleryPage);
router.post("/university/:id/gallery", upload.array("galleryImages", 10), universityController.uploadGalleryImages);
router.post("/university/:id/gallery/delete/:index", universityController.deleteGalleryImage);

// Partner routes
router.get("/university/:id/partners", protect, universityController.getPartnerPage);
router.post("/university/:id/partners", upload.array("partnerImages", 10), universityController.uploadPartnerImages);
router.post("/university/:id/partners/delete/:index", universityController.deletePartnerImage);

// Review routes
router.get("/university/:id/reviews", protect, universityController.getReviewPage);
router.post("/university/:id/reviews", upload.single("image"), universityController.addReview);
router.post("/university/:id/reviews/delete/:index", universityController.deleteReview);

// Course routes
router.get("/university/:id/courses", protect, universityController.getCoursePage);
router.post("/university/:id/courses", upload.single("courseImage"), universityController.addCourse);
router.post("/university/:id/courses/delete/:index", universityController.deleteCourse);

// Edit Course routes
router.get("/university/:id/courses/edit/:index", protect, universityController.getEditCoursePage);
router.post("/university/:id/courses/edit/:index", upload.single("courseImage"), universityController.postEditCourse);

module.exports = router;
