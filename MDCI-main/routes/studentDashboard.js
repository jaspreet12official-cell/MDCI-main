const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");

// Middleware to protect dashboard
function ensureStudentLoggedIn(req, res, next) {
  if (req.session?.student) return next();
  return res.redirect("/student-login");
}

router.get("/dashboard", ensureStudentLoggedIn, async (req, res) => {
  const student = await Student.findById(req.session.student.id).populate(
    "course"
  );
  res.render("admin/studentDashboard", { student, currentPath: req.path });
});

router.get("/profile", ensureStudentLoggedIn, async (req, res) => {
  const student = await Student.findById(req.session.student.id);
  res.render("admin/studentProfile", { student, currentPath: req.path });
});

router.get("/courses", ensureStudentLoggedIn, async (req, res) => {
  const student = await Student.findById(req.session.student.id).populate(
    "course"
  );
  res.render("admin/studentCourses", { student, currentPath: req.path });
});

router.get("/payments", ensureStudentLoggedIn, async (req, res) => {
  const student = await Student.findById(req.session.student.id);
  res.render("admin/studentPayments", { student, currentPath: req.path });
});

module.exports = router;
