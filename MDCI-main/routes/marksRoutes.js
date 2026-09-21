const express = require("express");
const router = express.Router();
const marksController = require("../controllers/marksController");

router.get("/select", marksController.selectStudentPage);
router.get("/form/:studentId", marksController.renderMarksForm);
router.post("/submit", marksController.submitMarks);
router.get("/certificate/:id", marksController.renderCertificate);
router.get("/marksheet/:id", marksController.renderMarksheet);

module.exports = router;
