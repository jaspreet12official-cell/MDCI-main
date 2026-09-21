// controllers/universityController.js
const fs = require("fs");
const path = require("path");
const University = require("../models/University");
const cloudinary = require("cloudinary").v2;

// Cloudinary config - common env var names with fallbacks
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUDINARY_NAME ||
    process.env.name,
  api_key:
    process.env.CLOUDINARY_API_KEY || process.env.API_KEY || process.env.apikey,
  api_secret:
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_API_SECRET_KEY ||
    process.env.API_SECRET ||
    process.env["api secret"],
  secure: true,
});

// Helper: upload local file to Cloudinary then remove local file
async function uploadToCloudinary(localFilePath, folder = "universities") {
  if (!fs.existsSync(localFilePath)) {
    throw new Error("Local file not found: " + localFilePath);
  }
  const result = await cloudinary.uploader.upload(localFilePath, {
    folder,
    use_filename: true,
    unique_filename: true,
    resource_type: "image",
  });
  // remove local temp file
  try {
    fs.unlinkSync(localFilePath);
  } catch (e) {
    // don't throw if unlink fails; log if desired
    console.warn("Failed to remove local file:", localFilePath, e.message);
  }
  return { url: result.secure_url, public_id: result.public_id };
}

// Helper: delete from cloudinary by public_id
async function deleteFromCloudinary(public_id) {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id, { resource_type: "image" });
  } catch (err) {
    console.warn("Cloudinary delete failed for:", public_id, err.message);
  }
}

// ---------- Main University ----------
exports.getUniversities = async (req, res, next) => {
  try {
    const universities = await University.find();
    res.render("admin/admin-university", {
      universities,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.postAddUniversity = async (req, res, next) => {
  try {
    let imageObj = null; // { url, public_id } or null

    if (req.file) {
      // multer saved file locally (e.g. /uploads/universities/filename)
      const localPath = path.join(
        process.cwd(),
        "uploads",
        "universities",
        req.file.filename
      );
      // make sure path exists - multer may have placed file at req.file.path; fallback:
      const candidate = req.file.path || localPath;
      imageObj = await uploadToCloudinary(candidate, "universities");
    }

    // NOTE: I store image as an object { url, public_id }.
    // Update your Mongoose schema accordingly (or map to string if you prefer).
    const payload = { ...req.body };
    if (imageObj) payload.image = imageObj; // { url, public_id }
    await University.create(payload);

    res.redirect("/admin/universities");
  } catch (err) {
    next(err);
  }
};

exports.getEditUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityEdit", {
      university,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

// make sure these are available at top of your controller file:
// const fs = require("fs");
// const path = require("path");
// and your helper deleteFromCloudinary & uploadToCloudinary exist as before

exports.postEditUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.status(404).send("University not found");

    // If a new file was uploaded, upload it to Cloudinary and store only the URL string
    if (req.file) {
      // If the previous image is stored as an object with public_id, delete it from Cloudinary
      if (
        university.image &&
        typeof university.image === "object" &&
        university.image.public_id
      ) {
        await deleteFromCloudinary(university.image.public_id);
      } else if (university.image && typeof university.image === "string") {
        // legacy local file path — remove local file if exists
        const localPath = path.join(
          process.cwd(),
          university.image.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch (e) {
            console.warn("Failed to unlink local old image:", e.message);
          }
        }
      }

      // Upload the new file to Cloudinary (uploadToCloudinary should return { url, public_id })
      const localCandidate =
        req.file.path ||
        path.join(process.cwd(), "uploads", "universities", req.file.filename);
      const newImageObj = await uploadToCloudinary(
        localCandidate,
        "universities"
      );

      // STORE ONLY THE URL STRING to match your current schema
      req.body.image = newImageObj.url;
    } else {
      // No new upload: ensure req.body.image stays a string.
      // If existing university.image is an object (from prior uploads), keep its url.
      if (university.image && typeof university.image === "object") {
        req.body.image = university.image.url || "";
      } else {
        req.body.image = university.image || "";
      }
    }

    // Update the university document with req.body (image is a string now)
    await University.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/universities");
  } catch (err) {
    next(err);
  }
};

exports.deleteUniversity = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) return res.redirect("/admin/universities");

    // delete main image
    if (university.image) {
      if (typeof university.image === "object" && university.image.public_id) {
        await deleteFromCloudinary(university.image.public_id);
      } else if (typeof university.image === "string") {
        // local file
        const localPath = path.join(
          process.cwd(),
          university.image.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
    }

    // delete gallery images from cloudinary/local (if stored as objects)
    if (Array.isArray(university.gallery)) {
      for (const g of university.gallery) {
        if (g && typeof g === "object" && g.public_id) {
          await deleteFromCloudinary(g.public_id);
        } else if (typeof g === "string") {
          const localPath = path.join(process.cwd(), g.replace(/^\//, ""));
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
      }
    }

    // delete placementPartnerImages
    if (Array.isArray(university.placementPartnerImages)) {
      for (const p of university.placementPartnerImages) {
        if (p && typeof p === "object" && p.public_id) {
          await deleteFromCloudinary(p.public_id);
        } else if (typeof p === "string") {
          const localPath = path.join(process.cwd(), p.replace(/^\//, ""));
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
      }
    }

    // delete reviews images
    if (Array.isArray(university.reviews)) {
      for (const r of university.reviews) {
        const img = r?.review?.image;
        if (img && typeof img === "object" && img.public_id) {
          await deleteFromCloudinary(img.public_id);
        } else if (typeof img === "string") {
          const localPath = path.join(process.cwd(), img.replace(/^\//, ""));
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
      }
    }

    // delete course images
    if (Array.isArray(university.courses)) {
      for (const c of university.courses) {
        const img = c?.course?.image;
        if (img && typeof img === "object" && img.public_id) {
          await deleteFromCloudinary(img.public_id);
        } else if (typeof img === "string") {
          const localPath = path.join(process.cwd(), img.replace(/^\//, ""));
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
      }
    }

    await University.findByIdAndDelete(req.params.id);
    res.redirect("/admin/universities");
  } catch (err) {
    next(err);
  }
};

// ---------- Gallery ----------
exports.getGalleryPage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityGallery", {
      university,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadGalleryImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    // convert each file to cloudinary upload and push { url, public_id }
    const uploaded = [];
    for (const f of files) {
      const localCandidate =
        f.path ||
        path.join(process.cwd(), "uploads", "universities", f.filename);
      const imgObj = await uploadToCloudinary(
        localCandidate,
        "universities/gallery"
      );
      uploaded.push(imgObj); // { url, public_id }
    }

    // Ensure gallery stores objects: [{url, public_id}, ...]
    await University.findByIdAndUpdate(req.params.id, {
      $push: { gallery: { $each: uploaded } },
    });
    res.redirect(`/admin/university/${req.params.id}/gallery`);
  } catch (err) {
    next(err);
  }
};

exports.deleteGalleryImage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    const index = parseInt(req.params.index, 10);
    if (!university)
      return res.redirect(`/admin/university/${req.params.id}/gallery`);

    if (!Array.isArray(university.gallery)) university.gallery = [];

    if (index >= 0 && index < university.gallery.length) {
      const imageEntry = university.gallery[index];
      // imageEntry may be object {url, public_id} or string
      if (
        imageEntry &&
        typeof imageEntry === "object" &&
        imageEntry.public_id
      ) {
        await deleteFromCloudinary(imageEntry.public_id);
      } else if (typeof imageEntry === "string") {
        const localPath = path.join(
          process.cwd(),
          imageEntry.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      university.gallery.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/gallery`);
  } catch (err) {
    next(err);
  }
};

// ---------- Placement Partners ----------
exports.getPartnerPage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityPlacement", {
      university,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadPartnerImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const uploaded = [];
    for (const f of files) {
      const localCandidate =
        f.path ||
        path.join(process.cwd(), "uploads", "universities", f.filename);
      const imgObj = await uploadToCloudinary(
        localCandidate,
        "universities/partners"
      );
      uploaded.push(imgObj);
    }
    await University.findByIdAndUpdate(req.params.id, {
      $push: { placementPartnerImages: { $each: uploaded } },
    });
    res.redirect(`/admin/university/${req.params.id}/partners`);
  } catch (err) {
    next(err);
  }
};

exports.deletePartnerImage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    const index = parseInt(req.params.index, 10);
    if (!university)
      return res.redirect(`/admin/university/${req.params.id}/partners`);

    if (
      index >= 0 &&
      index < (university.placementPartnerImages || []).length
    ) {
      const imageEntry = university.placementPartnerImages[index];
      if (
        imageEntry &&
        typeof imageEntry === "object" &&
        imageEntry.public_id
      ) {
        await deleteFromCloudinary(imageEntry.public_id);
      } else if (typeof imageEntry === "string") {
        const localPath = path.join(
          process.cwd(),
          imageEntry.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      university.placementPartnerImages.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/partners`);
  } catch (err) {
    next(err);
  }
};

// ---------- Reviews ----------
exports.getReviewPage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityReviews", {
      university,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (req, res, next) => {
  const universityId = req.params.id;
  const { reviewText, name, rating, review } = req.body;

  try {
    let imageObj = null;
    if (req.file) {
      const localCandidate =
        req.file.path ||
        path.join(process.cwd(), "uploads", "universities", req.file.filename);
      imageObj = await uploadToCloudinary(
        localCandidate,
        "universities/reviews"
      );
    }

    // push review; store review.image as object {url, public_id} or empty string/null
    await University.findByIdAndUpdate(universityId, {
      $push: {
        reviews: {
          reviewText,
          review: {
            name,
            rating: parseInt(rating),
            review,
            image: imageObj || "", // either object or empty string (legacy)
          },
        },
      },
    });

    res.redirect(`/admin/university/${universityId}/reviews`);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    const index = parseInt(req.params.index, 10);
    if (!university)
      return res.redirect(`/admin/university/${req.params.id}/reviews`);

    if (index >= 0 && index < (university.reviews || []).length) {
      const imageEntry = university.reviews[index]?.review?.image;
      if (
        imageEntry &&
        typeof imageEntry === "object" &&
        imageEntry.public_id
      ) {
        await deleteFromCloudinary(imageEntry.public_id);
      } else if (typeof imageEntry === "string" && imageEntry) {
        const localPath = path.join(
          process.cwd(),
          imageEntry.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      university.reviews.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/reviews`);
  } catch (err) {
    next(err);
  }
};

// ---------- Courses ----------
exports.getCoursePage = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityCourses", {
      university,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.addCourse = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const localCandidate =
      req.file.path ||
      path.join(process.cwd(), "uploads", "universities", req.file.filename);
    const imgObj = await uploadToCloudinary(
      localCandidate,
      "universities/courses"
    );

    const newCourse = {
      offeredCourseText: req.body.offeredCourseText,
      viewLink: req.body.viewLink,
      course: {
        name: req.body.courseName,
        image: imgObj, // { url, public_id }
        duration: req.body.duration,
      },
    };

    await University.findByIdAndUpdate(req.params.id, {
      $push: { courses: newCourse },
    });
    res.redirect(`/admin/university/${req.params.id}/courses`);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const university = await University.findById(req.params.id);
    const index = parseInt(req.params.index, 10);
    if (!university)
      return res.redirect(`/admin/university/${req.params.id}/courses`);

    if (index >= 0 && index < (university.courses || []).length) {
      const imageEntry = university.courses[index]?.course?.image;
      if (
        imageEntry &&
        typeof imageEntry === "object" &&
        imageEntry.public_id
      ) {
        await deleteFromCloudinary(imageEntry.public_id);
      } else if (typeof imageEntry === "string" && imageEntry) {
        const localPath = path.join(
          process.cwd(),
          imageEntry.replace(/^\//, "")
        );
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      university.courses.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/courses`);
  } catch (err) {
    next(err);
  }
};

exports.getEditCoursePage = async (req, res, next) => {
  try {
    const { id, index } = req.params;
    const university = await University.findById(id);

    if (!university || !university.courses[index]) {
      return res.status(404).send("Course not found");
    }

    const course = university.courses[index];
    res.render("admin/admin-universityEditCourse", {
      university,
      index,
      course,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.postEditCourse = async (req, res, next) => {
  try {
    const { id, index } = req.params;
    const university = await University.findById(id);
    if (!university || !university.courses[index]) {
      return res.status(404).send("Course not found");
    }

    const { offeredCourseText, viewLink, courseName, duration } = req.body;
    const course = university.courses[index];

    course.offeredCourseText = offeredCourseText;
    course.viewLink = viewLink;
    course.course.name = courseName;
    course.course.duration = duration;

    if (req.file) {
      // delete old
      const oldImage = course.course.image;
      if (oldImage && typeof oldImage === "object" && oldImage.public_id) {
        await deleteFromCloudinary(oldImage.public_id);
      } else if (typeof oldImage === "string" && oldImage) {
        const localPath = path.join(process.cwd(), oldImage.replace(/^\//, ""));
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }

      const localCandidate =
        req.file.path ||
        path.join(process.cwd(), "uploads", "universities", req.file.filename);
      const newImgObj = await uploadToCloudinary(
        localCandidate,
        "universities/courses"
      );
      course.course.image = newImgObj;
    }

    await university.save();
    res.redirect(`/admin/university/${id}/courses`);
  } catch (err) {
    next(err);
  }
};
