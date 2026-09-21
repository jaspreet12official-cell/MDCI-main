const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const protect = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "../uploads/courses");

// Create the folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer with the ensured folder
const upload = multer({ dest: uploadDir });

const courseController = require("../controllers/courseController");

router.get("/admin-course", protect, courseController.renderCourseForm);
router.post("/admin/add-category", courseController.addCategory);


router.post(
  "/add-course",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  courseController.addCourse
);

router.get("/edit-course/:id", protect, courseController.editCourseForm);

router.post(
  "/edit-course/:id",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  courseController.updateCourse
);

router.post("/delete-course/:id", courseController.deleteCourse);
router.get("/admin-course/:courseId/delete-topic/:topicIndex", courseController.deleteTopic);



module.exports = router;
