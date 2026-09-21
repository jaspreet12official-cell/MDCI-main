const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

router.get("/admin/subjects", subjectController.getSubjects);
router.post("/admin/subjects", subjectController.createSubject);
router.post("/admin/subjects/update/:id", subjectController.updateSubject);
router.get("/admin/subjects/delete/:id", subjectController.deleteSubject);
// Show edit form
router.get("/admin/subjects/edit/:id", subjectController.getEditSubject);

// Update subject after editing
router.post("/admin/subjects/update/:id", subjectController.updateSubject);


module.exports = router;
