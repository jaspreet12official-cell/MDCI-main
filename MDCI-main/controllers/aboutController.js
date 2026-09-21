const SiteConfig = require("../models/SiteConfig");
const Image = require("../models/Image");
const Content = require("../models/Content");
const educationController = require("./educationController");
const otherImages = require("../models/otherImages");
const reviewModel = require("../models/StudentReview");
const AboutMedia = require("../models/AboutMedia.js");

exports.renderAdminPageAboutUs = async (req, res) => {
  try {
    const [
      config,
      aboutUsMetaHeading,
      aboutUsMetaDescription,
      aboutUsMetaKeyword,
      ourEducationContent,
      studentReviewContent,
      topAboutSection,
      bottomAboutSection
    ] = await Promise.all([
      SiteConfig.findOne(),

      Content.findOne({ section: "aboutUsMetaHeading" }),
      Content.findOne({ section: "aboutUsMetaDescription" }),
      Content.findOne({ section: "aboutUsMetaKeyword" }),
      Content.findOne({ section: "ourEducationContent" }),
      Content.findOne({ section: "studentReviewContent" }),
      Content.findOne({ section: "topAboutSection" }),
      Content.findOne({ section: "bottomAboutSection" }),
    ]);

    const [topMediaRaw, bottomMediaRaw, latestMedia] = await Promise.all([
      AboutMedia.findOne({ section: "top" }).sort({ createdAt: -1 }).lean(),
      AboutMedia.findOne({ section: "bottom" }).sort({ createdAt: -1 }).lean(),
      AboutMedia.findOne().sort({ createdAt: -1 }).lean(),
    ]);

    // Fallback name detection
    const latestTopMedia = topMediaRaw
      ? {
          ...topMediaRaw,
          name: topMediaRaw.name || (topMediaRaw.imagePath ? "Image" : "Video Link"),
        }
      : null;

    const latestBottomMedia = bottomMediaRaw
      ? {
          ...bottomMediaRaw,
          name: bottomMediaRaw.name || (bottomMediaRaw.imagePath ? "Image" : "Video Link"),
        }
      : null;

    // Header & footer images
    let headerImage = null,
      footerImage = null;

    if (config) {
      const imageIds = [config.headerImageId, config.footerImageId].filter(Boolean);
      const images = await Image.find({ _id: { $in: imageIds } });

      const imageMap = {};
      images.forEach((img) => {
        imageMap[img._id.toString()] = img;
      });

      headerImage = config.headerImageId ? imageMap[config.headerImageId.toString()] : null;
      footerImage = config.footerImageId ? imageMap[config.footerImageId.toString()] : null;
    }

    // Get other assets
    const [PlacementImages, educationImages, reviews] = await Promise.all([
      otherImages.find({ section: "placement" }),
      educationController.geteducationImages(),
      reviewModel.find(),
    ]);

    res.render("admin/admin-aboutUs", {
      aboutUsMetaHeading: aboutUsMetaHeading?.html || "",
      aboutUsMetaDescription: aboutUsMetaDescription?.html || "",
      aboutUsMetaKeyword: aboutUsMetaKeyword?.html || "",
      ourEducationContent: ourEducationContent?.html || "",
      studentReviewContent: studentReviewContent?.html || "",
      topAboutSection: topAboutSection?.html || "",
      bottomAboutSection: bottomAboutSection?.html || "",
      currentPath: req.path,
      headerImageUrl: headerImage?.url || "/simpleImage.png",
      footerImageUrl: footerImage?.url || "/simpleImage.png",
      PlacementImages,
      educationImages,
      reviews,
      latestTopMedia,
      latestBottomMedia,
      latestMedia,
    });
  } catch (err) {
    next(err)
  }
};

exports.renderPageAboutUs = async (req, res) => {
  try {
    // Run these 3 queries in parallel
    const [
      config,
      aboutUsMetaHeading,
      aboutUsMetaDescription,
      aboutUsMetaKeyword,
      ourEducationContent,
      studentReviewContent,
      topAboutSection,
      bottomAboutSection
    ] = await Promise.all([
      SiteConfig.findOne(),

      Content.findOne({ section: "aboutUsMetaHeading" }),
      Content.findOne({ section: "aboutUsMetaDescription" }),
      Content.findOne({ section: "aboutUsMetaKeyword" }),
      Content.findOne({ section: "ourEducationContent" }),
      Content.findOne({ section: "studentReviewContent" }),
      Content.findOne({ section: "topAboutSection" }),
      Content.findOne({ section: "bottomAboutSection" }),
    ]);

    // Get media for about us
    const [latestTopMedia, latestBottomMedia] = await Promise.all([
      AboutMedia.findOne({ section: "top" }).sort({ createdAt: -1 }).lean(),
      AboutMedia.findOne({ section: "bottom" }).sort({ createdAt: -1 }).lean(),
    ]);

    // Media type fallback handling
    const parsedTopMedia = latestTopMedia
      ? {
          ...latestTopMedia,
          name: latestTopMedia.name || (latestTopMedia.imagePath ? "Image" : "Video Link"),
        }
      : null;

    const parsedBottomMedia = latestBottomMedia
      ? {
          ...latestBottomMedia,
          name: latestBottomMedia.name || (latestBottomMedia.imagePath ? "Image" : "Video Link"),
        }
      : null;

    // Run these image lookups in parallel if config exists
    let headerImage = null,
      footerImage = null;

    if (config) {
      const imageIds = [config.headerImageId, config.footerImageId].filter(Boolean);

      const images = await Image.find({ _id: { $in: imageIds } });

      const imageMap = {};
      images.forEach((img) => {
        imageMap[img._id.toString()] = img;
      });

      headerImage = config.headerImageId
        ? imageMap[config.headerImageId.toString()]
        : null;
      footerImage = config.footerImageId
        ? imageMap[config.footerImageId.toString()]
        : null;
    }

    const [PlacementImages, educationImages, reviews] = await Promise.all([
      otherImages.find({ section: "placement" }),
      educationController.geteducationImages(),
      reviewModel.find(),
    ]);

    res.render("aboutUs", {
      aboutUsMetaHeading: aboutUsMetaHeading?.html || "",
      aboutUsMetaDescription: aboutUsMetaDescription?.html || "",
      aboutUsMetaKeyword: aboutUsMetaKeyword?.html || "",
      ourEducationContent: ourEducationContent?.html || "",
      studentReviewContent: studentReviewContent?.html || "",
      topAboutSection: topAboutSection?.html || "",
      bottomAboutSection: bottomAboutSection?.html || "",
      currentPath: req.path,
      headerImageUrl: headerImage?.url || "/simpleImage.png",
      footerImageUrl: footerImage?.url || "/simpleImage.png",
      PlacementImages,
      educationImages,
      reviews,

      // sending processed media sections with proper 'name' field
      latestTopMedia: parsedTopMedia,
      latestBottomMedia: parsedBottomMedia,
    });
  } catch (err) {
    next(err);
  }
};
