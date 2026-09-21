const Subject = require("../models/SubjectModel");
const Course = require("../models/Course");

// Get all subjects with course name
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("course");
    const courses = await Course.find();
    res.render("admin/admin-subjects", { subjects, courses,currentPath: req.path, });
  } catch (err) {
        next(err)

  }
};

// Create subject
exports.createSubject = async (req, res) => {
  try {
    const { name, subjectCode, description, courseId } = req.body;
    await Subject.create({ name, subjectCode, description, course: courseId });
    res.redirect("/admin/subjects");
  } catch (err) {
        next(err)

};
}

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.redirect("/admin/subjects");
  } catch (err) {
        next(err)

  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { name, subjectCode, description, courseId } = req.body;
    await Subject.findByIdAndUpdate(req.params.id, {
      name,
      subjectCode,
      description,
      course: courseId,
    });
    res.redirect("/admin/subjects");
  } catch (err) {
        next(err)

  }
};
// GET: Render edit page
exports.getEditSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate("course");
    const courses = await Course.find();
    if (!subject) return res.status(404).send("Subject not found");

    res.render("admin/edit-subjects", { subject, courses,currentPath: req.path, });
  } catch (err) {
        next(err)

  }
};

// POST: Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { name, subjectCode, description, courseId } = req.body;

    await Subject.findByIdAndUpdate(req.params.id, {
      name,
      subjectCode,
      description,
      course: courseId,
    });

    res.redirect("/admin/subjects");
  } catch (err) {
        next(err)

}
}
