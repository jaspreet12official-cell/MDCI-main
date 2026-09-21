const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");


const eventController = require("../controllers/eventController");

// ✅ Folder path
const uploadDir = path.join(__dirname, "../uploads/events");

// ✅ Ensure the folder exists or create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ✅ Routes
router.get("/events", eventController.listEvents);
router.get("/admin-event",protect, eventController.renderEventForm);
router.post("/add-event", upload.single("eventImage"), eventController.createEvent);
router.get("/edit-event/:id",protect, eventController.editEventForm);
router.post("/edit-event/:id", upload.single("eventImage"), eventController.updateEvent);
router.post("/delete-event/:id", eventController.deleteEvent);


module.exports = router;
