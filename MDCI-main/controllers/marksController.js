const Student = require("../models/Student");
const Marks = require("../models/Marks");
const Subject = require("../models/SubjectModel");

exports.selectStudentPage = async (req, res) => {
  const students = await Student.find().populate("course");

  const issuedStudents = await Marks.find().populate({
    path: "student",
    populate: {
      path: "course", // ✅ important
      model: "Course",
    },
  });

  res.render("admin/studentCertificate", {
    students: students,
    issuedStudents: issuedStudents,
    currentPath: req.path,
  });
};

exports.renderMarksForm = async (req, res) => {
  const student = await Student.findById(req.params.studentId).populate(
    "course"
  );
  if (!student) return res.status(404).send("Student not found");

  const subjects = await Subject.find({ course: student.course._id });

  res.render("admin/marksForm", { student, subjects, currentPath: req.path, });
};

exports.submitMarks = async (req, res) => {
  try {
    const {
      studentId,
      issueDate,
      center,
      branchName,
      examMonth,
      examYear,
      courseCompletionDate,
      certificateNo,
      marks,
    } = req.body;

    const marksArray = Object.values(marks).map((entry) => ({
      subjectCode: entry.subjectCode,
      subjectName: entry.subjectName,
      minMarks: Number(entry.minMarks),
      maxMarks: Number(entry.maxMarks),
      theoryMarks: Number(entry.theoryMarks),
      practicalMarks: Number(entry.practicalMarks),
    }));

    await Marks.create({
      student: studentId,
      issueDate,
      center,
      branchName,
      examMonth,
      examYear,
      courseCompletionDate,
      certificateNo,
      marks: marksArray,
    });

    res.redirect("/admin/marks/select"); // or any success page
  } catch (err) {
        next(err)

  }
};
exports.renderCertificate = async (req, res) => {
  const data = await Marks.findById(req.params.id).populate({
    path: "student",
    populate: { path: "course" },
  });

  res.render("admin/certificate", { data, currentPath: req.path, });
};

exports.renderMarksheet = async (req, res) => {
  const data = await Marks.findById(req.params.id).populate({
    path: "student",
    populate: { path: "course" },
  });

  res.render("admin/marksheet", { data , currentPath: req.path,});
};
