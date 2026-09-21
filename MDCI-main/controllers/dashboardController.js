const Enrollment = require("../models/Student");
const Student = require("../models/Student");
const University = require("../models/University");
const Course = require("../models/Course");
const BannerInquiry = require("../models/BannerInquiry");
const ContactInquiry = require("../models/ContactInquiry");
const EnrollmentInquiry = require("../models/Enrollment");
const CourseCategory = require("../models/CourseCategory"); // ← ADDED

// ================= Admin Dashboard =================
const getAdminDashboard = async (req, res, next) => {
  try {
    const students = await Student.find().populate("course");

    const categories = await CourseCategory.find();

    // Initialize dynamic categoryCounts
    const categoryCounts = {};
    categories.forEach((cat) => {
      categoryCounts[cat.name.trim()] = 0;
    });

    // Count students per course category
    students.forEach((student) => {
      const courseCategory = student.course?.category?.trim();
      if (courseCategory && categoryCounts.hasOwnProperty(courseCategory)) {
        categoryCounts[courseCategory]++;
      }
    });

    // Other counts
    const totalEnrollments = students.length || 0;
    const totalUniversities = (await University.countDocuments()) || 0;
    const totalCourses = (await Course.countDocuments()) || 0;
    const totalCouncilList = (await BannerInquiry.countDocuments()) || 0;
    const totalGetInTouch = (await ContactInquiry.countDocuments()) || 0;
    const totalEnrollmentRequests =
      (await EnrollmentInquiry.countDocuments()) || 0;

    // Dynamic stats for each course category
    const stats = categories.map((cat) => ({
      count: categoryCounts[cat.name.trim()] || 0,
      label: cat.name,
      icon: cat.icon || "fa-code", // fallback icon if missing
      color: "bg-main-600", // optional: can customize by category later
    }));

    // Additional static stats
    stats.push(
      {
        count: totalUniversities,
        label: "Total Universities",
        icon: "fa-university",
        color: "bg-main-600",
      },
      {
        count: totalCourses,
        label: "Total Courses",
        icon: "fa-book",
        color: "bg-main-two-600",
      },
      {
        count: totalEnrollments,
        label: "Total Students",
        icon: "fa-user-graduate",
        color: "bg-purple-600",
      },
      {
        count: totalCouncilList,
        label: "Council List",
        icon: "fa-users",
        color: "bg-green-600",
      },
      {
        count: totalGetInTouch,
        label: "Total Get In Touch",
        icon: "fa-envelope-open-text",
        color: "bg-main-two-600",
      },
      {
        count: totalEnrollmentRequests,
        label: "Total Enrollment Requests",
        icon: "fa-user-edit",
        color: "bg-warning-600",
      }
    );

    res.render("admin/dashboard", {
      currentPath: req.path,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// ================= Student Dashboard =================
const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      email: req.session.student?.email,
    }).populate("course");

    if (!student) {
      const error = new Error("Student not found");
      error.statusCode = 404;
      throw error;
    }

    res.render("studentdashboard", {
      student,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
};
