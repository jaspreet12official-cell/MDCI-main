// ===========================
// contactController.js (Final Fixed with Cloudinary)
// ===========================

const ContactSection = require("../models/ContactSection");
const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");
const cloudinary = require("../config/cloudinary"); // ✅ Cloudinary config

exports.getContactSection = async (req, res, next) => {
  try {
    const [
      siteConfig,
      contactMetaHeading,
      contactMetaDescription,
      contactMetaKeyword,
      topContactSection,
      homepage,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "contactMetaHeading" }),
      Content.findOne({ section: "contactMetaDescription" }),
      Content.findOne({ section: "contactMetaKeyword" }),
      Content.findOne({ section: "topContactSection" }),
      Content.findOne({ section: "homepage" }),
    ]);

    const contactSections = await ContactSection.find();

    res.render("contact", {
      homepage: homepage?.html || "",
      contactMetaHeading: contactMetaHeading?.html || "",
      contactMetaDescription: contactMetaDescription?.html || "",
      contactMetaKeyword: contactMetaKeyword?.html || "",
      topContactSection: topContactSection?.html || "",
      siteConfig,
      contactSections,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminContactSection = async (req, res, next) => {
  try {
    const [
      siteConfig,
      contactMetaHeading,
      contactMetaDescription,
      contactMetaKeyword,
      topContactSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "contactMetaHeading" }),
      Content.findOne({ section: "contactMetaDescription" }),
      Content.findOne({ section: "contactMetaKeyword" }),
      Content.findOne({ section: "topContactSection" }),
    ]);

    const contactSections = await ContactSection.find();

    res.render("admin/admin-contact", {
      contactMetaHeading: contactMetaHeading?.html || "",
      contactMetaDescription: contactMetaDescription?.html || "",
      contactMetaKeyword: contactMetaKeyword?.html || "",
      topContactSection: topContactSection?.html || "",
      siteConfig,
      contactSections,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.postContactSection = async (req, res, next) => {
  const { id = [], name = [], heading = [], content = [] } = req.body;

  try {
    for (let i = 0; i < 3; i++) {
      if (!heading[i] || !content[i]) continue;

      const imageFile = req.files[`image${i}`]?.[0]; // May be undefined
      let imageUrl;

      if (imageFile) {
        // ✅ Upload file buffer to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
          folder: "contact", // Cloudinary folder name
        });
        imageUrl = uploadResult.secure_url;
      }

      const updateData = {
        name: name[i] || `Section ${i + 1}`,
        heading: heading[i],
        content: content[i],
      };

      if (imageUrl) {
        updateData.imagePath = imageUrl; // Save Cloudinary URL instead of local path
      }

      if (id[i]) {
        await ContactSection.findByIdAndUpdate(id[i], updateData);
      } else {
        await new ContactSection(updateData).save();
      }
    }

    res.redirect("/admin-contact");
  } catch (err) {
    next(err);
  }
};
