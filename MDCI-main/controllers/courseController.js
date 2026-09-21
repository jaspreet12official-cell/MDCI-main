// controllers/courseController.js
const Course = require("../models/Course");
const fs = require("fs");
const path = require("path");
const Category = require("../models/CourseCategory");
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // if not already loaded in your app

// Cloudinary config - update env var names if yours differ
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY || process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || process.env.API_SECRET,
  secure: true,
});

// Default footer image (fallback)
const defaultFooterImage = "/simpleImage.png";

// Helpers
async function uploadToCloudinary(localFilePath, folder = "courses", resource_type = "image") {
  if (!fs.existsSync(localFilePath)) {
    throw new Error("Local file not found: " + localFilePath);
  }

  const options = {
    folder,
    use_filename: true,
    unique_filename: true,
  };

  // for non-image files (pdf) allow auto/raw upload
  if (resource_type === "raw" || resource_type === "auto") {
    // cloudinary can auto-detect; we still pass resource_type if needed in destroy later
    options.resource_type = resource_type;
  }

  const result = await cloudinary.uploader.upload(localFilePath, options);
  // remove local temp file
  try {
    fs.unlinkSync(localFilePath);
  } catch (e) {
    console.warn("Failed to remove local file:", localFilePath, e.message);
  }
  return { url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || "image" };
}

async function deleteFromCloudinary(public_id, resource_type = "image") {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id, { resource_type });
  } catch (err) {
    console.warn("Cloudinary delete failed for:", public_id, err.message);
  }
}

// Show add-course page with all existing courses
exports.renderCourseForm = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    const categories = await Category.find().sort("name"); // get all categories
    res.render("admin/admin-course", {
      courses,
      categories,
      currentPath: req.path,
      footerImageUrl: defaultFooterImage,
    });
  } catch (error) {
    console.error("Error loading course form:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addCategory = async (req, res) => {
  const { name, icon } = req.body;

  if (!name?.trim()) {
    return res.redirect("back");
  }

  const iconToSave = icon?.trim() || "fa-code"; // set default if empty

  await Category.create({
    name: name.trim(),
    icon: iconToSave,
  });

  res.redirect("back");
};

exports.addCourse = async (req, res) => {
  try {
    const {
      name,
      rating,
      fees,
      topicCoverContent,
      metaTitle,
      metaDescription,
      metaKeywords,
      category,
    } = req.body;

    // Parse topics from simpler arrays
    const names = req.body.topicNames || [];
    const durations = req.body.topicDurations || [];

    const parsedTopics = names.map((tName, index) => ({
      name: tName,
      duration: durations[index] || "",
    }));

    // File inputs (multer with fields like courseImage, pdf)
    const courseImageFileObj = req.files?.courseImage?.[0]; // multer file object
    const pdfFileObj = req.files?.pdf?.[0];

    let courseImageUrl;
    let pdfUrl;

    // Upload course image to Cloudinary if present
    if (courseImageFileObj) {
      const localImagePath = courseImageFileObj.path || path.join(process.cwd(), "uploads", "courses", courseImageFileObj.filename);
      try {
        const uploaded = await uploadToCloudinary(localImagePath, "courses/images", "image");
        courseImageUrl = uploaded.url; // store only URL string to match your schema
        // If you later want to keep public_id, consider storing uploaded.public_id in another DB field
      } catch (err) {
        console.error("Image upload failed:", err);
        // continue without image or handle as error
      }
    }

    // Upload pdf to Cloudinary if present (resource_type auto/raw)
    if (pdfFileObj) {
      const localPdfPath = pdfFileObj.path || path.join(process.cwd(), "uploads", "courses", pdfFileObj.filename);
      try {
        // use resource_type 'auto' so cloudinary handles the pdf
        const uploadedPdf = await uploadToCloudinary(localPdfPath, "courses/pdfs", "auto");
        pdfUrl = uploadedPdf.url;
      } catch (err) {
        console.error("PDF upload failed:", err);
      }
    }

    const newCourse = new Course({
      name,
      rating,
      fees,
      topicCoverContent,
      topics: parsedTopics,
      courseImage: courseImageUrl || undefined,
      pdf: pdfUrl || undefined,
      metaTitle,
      metaDescription,
      metaKeywords,
      category,
    });

    await newCourse.save();
    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Render the course edit form
exports.editCourseForm = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect("/admin-course?error=notfound");
    res.render("admin/edit-course", {
      course,
      currentPath: req.path,
      footerImageUrl: defaultFooterImage,
    });
  } catch (error) {
    console.error("Error loading course:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const {
      name,
      rating,
      fees,
      topicCoverContent,
      metaTitle,
      metaDescription,
      metaKeywords,
      category,
    } = req.body;

    const names = req.body.topicNames || [];
    const durations = req.body.topicDurations || [];

    const parsedTopics = names.map((tName, index) => ({
      name: tName,
      duration: durations[index] || "",
    }));

    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect("/admin-course?error=notfound");

    // New uploaded files (multer)
    const courseImageFileObj = req.files?.courseImage?.[0];
    const pdfFileObj = req.files?.pdf?.[0];

    // If new course image uploaded -> upload to Cloudinary and store URL
    if (courseImageFileObj) {
      // If current stored course.courseImage is an object with public_id, delete from cloudinary
      if (course.courseImage && typeof course.courseImage === "object" && course.courseImage.public_id) {
        await deleteFromCloudinary(course.courseImage.public_id, course.courseImage.resource_type || "image");
      } else if (course.courseImage && typeof course.courseImage === "string") {
        // If it's a local path (starts with /uploads) delete local file
        if (course.courseImage.startsWith("/uploads") || course.courseImage.startsWith("uploads")) {
          const oldImagePath = path.join(__dirname, "..", course.courseImage);
          try {
            fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
          } catch (e) {
            console.warn("Failed to delete old local course image:", e.message);
          }
        }
        // If it's a Cloudinary URL string we can't extract public_id reliably; skip deletion
      }

      const localImagePath = courseImageFileObj.path || path.join(process.cwd(), "uploads", "courses", courseImageFileObj.filename);
      try {
        const uploaded = await uploadToCloudinary(localImagePath, "courses/images", "image");
        // store only url string
        course.courseImage = uploaded.url;
      } catch (err) {
        console.error("Image upload failed during update:", err);
      }
    }

    // If new pdf uploaded -> upload and store URL
    if (pdfFileObj) {
      if (course.pdf && typeof course.pdf === "object" && course.pdf.public_id) {
        await deleteFromCloudinary(course.pdf.public_id, course.pdf.resource_type || "auto");
      } else if (course.pdf && typeof course.pdf === "string") {
        if (course.pdf.startsWith("/uploads") || course.pdf.startsWith("uploads")) {
          const oldPdfPath = path.join(__dirname, "..", course.pdf);
          try {
            fs.existsSync(oldPdfPath) && fs.unlinkSync(oldPdfPath);
          } catch (e) {
            console.warn("Failed to delete old local pdf:", e.message);
          }
        }
      }

      const localPdfPath = pdfFileObj.path || path.join(process.cwd(), "uploads", "courses", pdfFileObj.filename);
      try {
        const uploadedPdf = await uploadToCloudinary(localPdfPath, "courses/pdfs", "auto");
        course.pdf = uploadedPdf.url;
      } catch (err) {
        console.error("PDF upload failed during update:", err);
      }
    }

    // Update fields
    course.name = name;
    course.rating = rating;
    course.fees = fees;
    course.topicCoverContent = topicCoverContent;
    course.metaTitle = metaTitle;
    course.metaDescription = metaDescription;
    course.metaKeywords = metaKeywords;
    course.topics = parsedTopics;
    course.category = category;

    await course.save();
    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      // If course.courseImage stored as object with public_id, delete from Cloudinary
      if (course.courseImage && typeof course.courseImage === "object" && course.courseImage.public_id) {
        await deleteFromCloudinary(course.courseImage.public_id, course.courseImage.resource_type || "image");
      } else if (course.courseImage && typeof course.courseImage === "string") {
        // If local file path, delete local
        if (course.courseImage.startsWith("/uploads") || course.courseImage.startsWith("uploads")) {
          const imagePath = path.join(__dirname, "..", course.courseImage);
          fs.existsSync(imagePath) && fs.unlinkSync(imagePath);
        }
        // If it's a cloud URL string, can't delete without public_id
      }

      // If course.pdf stored as object with public_id, delete from Cloudinary
      if (course.pdf && typeof course.pdf === "object" && course.pdf.public_id) {
        await deleteFromCloudinary(course.pdf.public_id, course.pdf.resource_type || "auto");
      } else if (course.pdf && typeof course.pdf === "string") {
        if (course.pdf.startsWith("/uploads") || course.pdf.startsWith("uploads")) {
          const pdfPath = path.join(__dirname, "..", course.pdf);
          fs.existsSync(pdfPath) && fs.unlinkSync(pdfPath);
        }
      }

      await Course.findByIdAndDelete(req.params.id);
    }

    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { courseId, topicIndex } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Remove topic at given index
    course.topics.splice(topicIndex, 1);

    await course.save();
    res.redirect(`/edit-course/${courseId}`);
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const allCourses = await Course.find();

    const groupedCourses = {};

    allCourses.forEach((course) => {
      const category = course.category || "Others";
      if (!groupedCourses[category]) {
        groupedCourses[category] = [];
      }
      groupedCourses[category].push(course);
    });

    res.render("ourCourses", {
      groupedCourses,
      currentPath: req.path,
      footerImageUrl: defaultFooterImage,
    });
  } catch (err) {
    next(err);
  }
};
