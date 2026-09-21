// routes/studentRoutes.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload folder setup (temp storage)
const uploadPath = path.join(__dirname, "../uploads/students");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// Helper: upload file at localPath to Cloudinary, then remove local file
async function uploadToCloudinaryAndCleanup(localPath, folder = "students") {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      use_filename: true,
      unique_filename: false,
      resource_type: "image",
    });
    // remove local file
    try {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (e) {
      console.warn("Failed to remove temp file:", localPath, e);
    }
    return result; // contains secure_url and public_id
  } catch (err) {
    // If upload fails, try removing local file then rethrow
    try {
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
    } catch (e) {}
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
}

// ---------------- ROUTES ------------------

// Show all students + form
router.get(
  "/admin/student/enroll",
  protect,
  catchAsync(async (req, res) => {
    const students = await Student.find().populate("course").sort({ createdAt: -1 });
    const courses = await Course.find();
    res.render("admin/student-enroll", {
      students,
      courses,
      currentPath: req.path,
    });
  })
);

// ✅ FIXED: Create student (POST now matches GET route)
router.post(
  "/admin/student/enroll",
  upload.single("image"), // ensure your form input name is 'image'
  catchAsync(async (req, res) => {
    const studentData = req.body;

    // Basic validation
    if (!studentData.course || studentData.course.trim() === "") {
      // remove uploaded temp file if any
      if (req.file) {
        const temp = path.join(uploadPath, req.file.filename);
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
      return res.status(400).send("Course selection is required");
    }
    if (!studentData.password || studentData.password.trim() === "") {
      if (req.file) {
        const temp = path.join(uploadPath, req.file.filename);
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
      return res.status(400).send("Password is required");
    }

    // Unique regNo
    const existingStudent = await Student.findOne({ regNo: studentData.regNo });
    if (existingStudent) {
      if (req.file) {
        const temp = path.join(uploadPath, req.file.filename);
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
      return res.status(400).send("Student with this registration number already exists.");
    }

    // Handle image: upload to Cloudinary if present
    if (req.file) {
      const localPath = path.join(uploadPath, req.file.filename);
      const uploaded = await uploadToCloudinaryAndCleanup(localPath, "students");
      studentData.imagePath = uploaded.secure_url;
      studentData.imagePublicId = uploaded.public_id;
    } else {
      studentData.imagePath = studentData.imagePath || "";
      studentData.imagePublicId = studentData.imagePublicId || "";
    }

    // Optional courseCategory fallback
    studentData.courseCategory = studentData.courseCategory || "";

    await Student.create(studentData);
    res.redirect("/admin/student/enroll");
  })
);

// Delete student
router.post(
  "/admin/student/delete/:id",
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.redirect("/admin/student/enroll");
    }

    // If image stored on Cloudinary, remove it
    if (student.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(student.imagePublicId, {
          resource_type: "image",
        });
      } catch (err) {
        console.warn("Failed to delete cloudinary image:", err);
      }
    } else if (student.imagePath && student.imagePath.startsWith("/uploads/")) {
      // fallback: local file — strip leading slash before join
      const rel = student.imagePath.replace(/^\//, "");
      const fullPath = path.join(__dirname, "..", rel);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/admin/student/enroll");
  })
);

// Show edit student form
router.get(
  "/admin/student/edit/:id",
  protect,
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    const courses = await Course.find();
    if (!student) return res.status(404).send("Student not found");
    res.render("admin/student-edit", {
      student,
      courses,
      currentPath: req.path,
    });
  })
);

// Update student with optional new image
router.post(
  "/admin/student/edit/:id",
  upload.single("image"),
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    // Validate course
    if (!req.body.course || req.body.course.trim() === "") {
      // cleanup temp upload if any
      if (req.file) {
        const temp = path.join(uploadPath, req.file.filename);
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
      return res.status(400).send("Course selection is required");
    }

    // If a new file is uploaded: upload to Cloudinary, delete previous cloud image if exists
    if (req.file) {
      const localPath = path.join(uploadPath, req.file.filename);
      const uploaded = await uploadToCloudinaryAndCleanup(localPath, "students");

      // Delete old cloud image if exists
      if (student.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(student.imagePublicId, {
            resource_type: "image",
          });
        } catch (err) {
          console.warn("Failed to delete old cloudinary image:", err);
        }
      } else if (student.imagePath && student.imagePath.startsWith("/uploads/")) {
        // fallback: remove old local image (strip leading slash)
        const oldRel = student.imagePath.replace(/^\//, "");
        const oldPath = path.join(__dirname, "..", oldRel);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // set new values
      req.body.imagePath = uploaded.secure_url;
      req.body.imagePublicId = uploaded.public_id;
    } else {
      // preserve old image values if not uploading new one
      req.body.imagePath = student.imagePath;
      req.body.imagePublicId = student.imagePublicId || "";
    }

    // Preserve courseCategory (safe)
    req.body.courseCategory = req.body.courseCategory || student.courseCategory || "";

    await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.redirect("/admin/student/enroll");
  })
);

// Show fees form
router.get(
  "/admin/student/:id/fees",
  protect,
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");
    res.render("admin/student-fees", { student, currentPath: req.path });
  })
);

// Handle fees submission
router.post(
  "/admin/student/:id/fees",
  catchAsync(async (req, res) => {
    const { totalFees, discountPercent, payAmount, lastPaidDate, receiptNo } = req.body;
    const total = parseFloat(totalFees) || 0;
    const discount = parseFloat(discountPercent) || 0;
    const discountAmount = (total * discount) / 100;
    const finalAmount = total - discountAmount;
    const payNow = parseFloat(payAmount) || 0;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    if (!student.fees) student.fees = {};
    if (!student.fees.installments) student.fees.installments = [];

    const prevPaid = parseFloat(student.fees.amountPaid || 0);
    const newTotalPaid = prevPaid + payNow;
    const dues = finalAmount - newTotalPaid;

    if (payNow > 0 && lastPaidDate && receiptNo) {
      student.fees.installments.push({
        amount: payNow,
        date: new Date(lastPaidDate),
        receiptNo,
      });
    }

    const isFirstInstallment = student.fees.installments.length <= 1;
    if (isFirstInstallment) {
      student.fees.totalFees = total;
      student.fees.discountPercent = discount;
      student.fees.discountAmount = discountAmount;
      student.fees.finalAmount = finalAmount;
    }

    student.fees.amountPaid = newTotalPaid;
    student.fees.dues = dues;
    student.fees.lastPaidDate = lastPaidDate || null;
    student.fees.receiptNo = receiptNo || "";

    await student.save();
    res.redirect("/admin/student/enroll");
  })
);

// Fees structure table
router.get(
  "/admin/student/fees-structure",
  protect,
  catchAsync(async (req, res) => {
    const students = await Student.find().populate("course").sort({ name: 1 });
    res.render("admin/fees-Structure", { students, currentPath: req.path });
  })
);

module.exports = router;
