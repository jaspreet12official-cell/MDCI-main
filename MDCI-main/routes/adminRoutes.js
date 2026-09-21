const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// ===================== Admin Routes =====================
router.get("/admin-login", authController.getAdminLogin);
router.post("/admin/login", authController.postAdminLogin);
router.get("/admin/logout", authController.adminLogout);

// ===================== Student Routes =====================
router.get("/student-login", authController.getStudentLogin);
router.post("/student/login", authController.postStudentLogin);
router.get("/student/logout", authController.studentLogout);

module.exports = router;
