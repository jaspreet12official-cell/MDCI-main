const Admin = require("../models/AdminModel");
const Student = require("../models/Student");
const SiteConfig = require("../models/SiteConfig");
const Image = require("../models/Image");

// Helper to get header image
async function getHeaderImage() {
  let headerImageUrl = "/simpleImage.png";
  const config = await SiteConfig.findOne();
  if (config?.headerImageId) {
    const image = await Image.findById(config.headerImageId);
    if (image?.url) headerImageUrl = image.url;
  }
  return headerImageUrl;
}

// ===================== Admin =====================
const getAdminLogin = async (req, res) => {
  const headerImageUrl = await getHeaderImage();
  res.render("admin-login", {
    headerImageUrl,
    errorMessage: null,
    currentPath: req.path,
  });
};

const postAdminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    const isMatch = admin ? await admin.matchPassword(password) : false;

    if (!admin || !isMatch) {
      const headerImageUrl = await getHeaderImage();
      return res.status(401).render("admin-login", {
        errorMessage: "Invalid username or password",
        headerImageUrl,
        currentPath: req.path,
      });
    }

    req.session.admin = {
      id: admin._id,
      username: admin.username,
    };

    res.redirect("/admin/dashboard");
  } catch (err) {
    next(err);
  }
};

const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Could not log out.");
    res.clearCookie("connect.sid");
    res.redirect("/admin-login");
  });
};

// ===================== Student =====================
const getStudentLogin = async (req, res) => {
  const headerImageUrl = await getHeaderImage();
  res.render("student-login", {
    headerImageUrl,
    errorMessage: null,
    currentPath: req.path,
  });
};

const postStudentLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    console.log("Student:", student);

    // TEMP FIX (if password not hashed)
    const isMatch = student ? password === student.password : false;

    if (!student || !isMatch) {
      const headerImageUrl = await getHeaderImage();
      return res.status(401).render("student-login", {
        errorMessage: "Invalid email or password",
        headerImageUrl,
        currentPath: req.path,
      });
    }

    req.session.student = {
      id: student._id,
      email: student.email,
    };

    res.redirect("/student/dashboard");
  } catch (err) {
    next(err);
  }
};

const studentLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Could not log out.");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

module.exports = {
  getAdminLogin,
  postAdminLogin,
  adminLogout,
  getStudentLogin,
  postStudentLogin,
  studentLogout,
};
