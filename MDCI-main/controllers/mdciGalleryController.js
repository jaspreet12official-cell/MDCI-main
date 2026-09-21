const path = require("path");
const fs = require("fs");
const Image = require("../models/otherImages");

// GET: Render MDCI Gallery Edit Page
exports.getMdciGallery = async (req, res) => {
  try {
    const galleryImages = await Image.find({ section: "MDCIGallery" }).sort({ _id: -1 });
    res.render("admin/admin-gallery", { galleryImages, currentPath: req.path, });
  } catch (err) {
        next(err)

  }
};

// POST: Upload Images to MDCI Gallery
exports.uploadMdciGalleryImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    const uploaded = req.files.map(file => ({
      imagePath: `/uploads/mdciGallery/${file.filename}`,
      section: "MDCIGallery"
    }));

    await Image.insertMany(uploaded);
    res.redirect("/admin-gallery");
  } catch (err) {
        next(err)

  }
};

// POST: Delete Image from MDCI Gallery
exports.deleteMdciGalleryImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image || image.section !== "MDCIGallery") {
      return res.status(404).send("Image not found or invalid section.");
    }

    const filePath = path.join(__dirname, "../public", image.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.findByIdAndDelete(req.params.id);
    res.redirect("/admin-gallery");
  } catch (err) {
        next(err)

  }
};
