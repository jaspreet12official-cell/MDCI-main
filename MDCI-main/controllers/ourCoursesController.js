const Course = require("../models/Course.js");
const StudentReview = require("../models/StudentReview.js");

exports.renderOurCoursesPage = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    const allCourses = await Course.find().sort({ createdAt: -1 });

    const groupedCourses = {};
    allCourses.forEach((course) => {
      const category = course.category || "Uncategorized";
      if (!groupedCourses[category]) {
        groupedCourses[category] = [];
      }
      groupedCourses[category].push(course);
    });

    res.render("ourCourses", {
      courses,
      groupedCourses, // 👈 added this
    });
  } catch (err) {
        next(err)

  }
};

exports.renderCourseDetailsPage = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId); // ✅ get a specific course

    if (!course) {
      return res.status(404).send("Course not found");
    }
    const reviews = await StudentReview.find();
    const allCourses = await Course.find().sort({ createdAt: -1 });

    const groupedCourses = {};
    allCourses.forEach((course) => {
      const category = course.category || "Uncategorized";
      if (!groupedCourses[category]) {
        groupedCourses[category] = [];
      }
      groupedCourses[category].push(course);
    });

    res.render("courseDetails", {
      course,
      reviews,
      groupedCourses,
      currentPath: req.path, // 👈 added this
    });
  } catch (err) {
        next(err)

  }
};
