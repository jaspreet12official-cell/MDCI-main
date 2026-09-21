const SiteConfig = require("../models/SiteConfig");
const Image = require("../models/Image");
const Content = require("../models/Content");
const galleryController = require("./galleryController"); // ✅ fixed path
const educationController = require("./educationController"); // ✅ fixed path
const placementStudentsController = require("./placementStudentsController"); // ✅ fixed path
const otherImages = require("../models/otherImages");
const Faq = require("../models/FAQ"); // import your FAQ model
const reviewModel = require("../models/StudentReview");
const AboutMedia = require("../models/AboutMedia.js");
const University = require("../models/University.js");
const Course = require("../models/Course.js");

exports.renderHomePage = async (req, res) => {
  try {
    // Run these 3 queries in parallel
    const [
      config,
      homepageContent,
      contentAboveForm,
      placementContent,
      whyChooseUs,
      homeYoutubeLink,
      contentBesideYoutube,
      ourCoursesContent,
      ourEventsContent,
      contentBelowGallery,
      ourCollegesContent,
      studentReviewContent,
      contentStarStudent,
      homeLoctionContent,
      faqHeading,
      homeMetaHeading,
      homeMetaDescription,
      homeMetaKeyword,
      homeBlogSection,
      ourEducationContent,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "homepage" }),
      Content.findOne({ section: "contentAboveForm" }),
      Content.findOne({ section: "placementContent" }),
      Content.findOne({ section: "whyChooseUs" }),
      Content.findOne({ section: "homeYoutubeLink" }),
      Content.findOne({ section: "contentBesideYoutube" }),
      Content.findOne({ section: "ourCoursesContent" }),
      Content.findOne({ section: "ourEventsContent" }),
      Content.findOne({ section: "contentBelowGallery" }),
      Content.findOne({ section: "ourCollegesContent" }),
      Content.findOne({ section: "studentReviewContent" }),
      Content.findOne({ section: "contentStarStudent" }),
      Content.findOne({ section: "homeLoctionContent" }),
      Content.findOne({ section: "faqHeading" }),
      Content.findOne({ section: "homeMetaHeading" }),
      Content.findOne({ section: "homeMetaDescription" }),
      Content.findOne({ section: "homeMetaKeyword" }),
      Content.findOne({ section: "homeBlogSection" }),
      Content.findOne({ section: "ourEducationContent" }),
    ]);

    // Run these image lookups in parallel if config exists
    let headerImage = null,
      footerImage = null,
      bannerImage = null;

    if (config) {
      const imageIds = [
        config.headerImageId,
        config.footerImageId,
        config.bannerImageId,
      ].filter((id) => id); // filter out undefined/null

      const images = await Image.find({ _id: { $in: imageIds } });

      // Map images by id for quick lookup
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
      bannerImage = config.bannerImageId
        ? imageMap[config.bannerImageId.toString()]
        : null;
    }

    // Run these queries in parallel
    const [
      PlacementImages,
      galleryImages,
      faqs,
      educationImages,
      placementStudentImages,
      reviews,
    ] = await Promise.all([
      otherImages.find({ section: "placement" }),
      galleryController.getGalleryImages(),
      Faq.find(),
      educationController.geteducationImages(),
      placementStudentsController.getplacementStudentsImages(),
      reviewModel.find(),
    ]);
    const universities = await University.find();
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

    res.render("home", {
      currentContent: homepageContent?.html || "",
      contentAboveForm: contentAboveForm?.html || "",
      placementContent: placementContent?.html || "",
      homeYoutubeLink: homeYoutubeLink?.html || "",
      whyChooseUs: whyChooseUs?.html || "",
      contentBesideYoutube: contentBesideYoutube?.html || "",
      ourCoursesContent: ourCoursesContent?.html || "",
      ourEventsContent: ourEventsContent?.html || "",
      contentBelowGallery: contentBelowGallery?.html || "",
      ourCollegesContent: ourCollegesContent?.html || "",
      studentReviewContent: studentReviewContent?.html || "",
      contentStarStudent: contentStarStudent?.html || "",
      homeLoctionContent: homeLoctionContent?.html || "",
      faqHeading: faqHeading?.html || "",
      homeMetaHeading: homeMetaHeading?.html || "",
      homeMetaDescription: homeMetaDescription?.html || "",
      homeMetaKeyword: homeMetaKeyword?.html || "",
      homeBlogSection: homeBlogSection?.html || "",
      ourEducationContent: ourEducationContent?.html || "",
      headerImageUrl: headerImage?.url || "/simpleImage.png",
      footerImageUrl: footerImage?.url || "/simpleImage.png",
      bannerImageUrl: bannerImage?.url || "/simpleImage.png",
      PlacementImages,
      galleryImages,
      educationImages,
      placementStudentImages,
      reviews,
      faqs,
      universities,
      courses,
      groupedCourses, // 👈 added this
    });
  } catch (err) {
        next(err)

  }
};

exports.renderAdminPage = async (req, res) => {
  try {
    // Run these 3 queries in parallel
    const [
      config,
      homepageContent,
      contentAboveForm,
      placementContent,
      whyChooseUs,
      homeYoutubeLink,
      contentBesideYoutube,
      ourCoursesContent,
      ourEventsContent,
      contentBelowGallery,
      ourCollegesContent,
      studentReviewContent,
      contentStarStudent,
      homeLoctionContent,
      faqHeading,
      homeMetaHeading,
      homeMetaDescription,
      homeMetaKeyword,
      homeBlogSection,
      ourEducationContent,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "homepage" }),
      Content.findOne({ section: "contentAboveForm" }),
      Content.findOne({ section: "placementContent" }),
      Content.findOne({ section: "whyChooseUs" }),
      Content.findOne({ section: "homeYoutubeLink" }),
      Content.findOne({ section: "contentBesideYoutube" }),
      Content.findOne({ section: "ourCoursesContent" }),
      Content.findOne({ section: "ourEventsContent" }),
      Content.findOne({ section: "contentBelowGallery" }),
      Content.findOne({ section: "ourCollegesContent" }),
      Content.findOne({ section: "studentReviewContent" }),
      Content.findOne({ section: "contentStarStudent" }),
      Content.findOne({ section: "homeLoctionContent" }),
      Content.findOne({ section: "faqHeading" }),
      Content.findOne({ section: "homeMetaHeading" }),
      Content.findOne({ section: "homeMetaDescription" }),
      Content.findOne({ section: "homeMetaKeyword" }),
      Content.findOne({ section: "homeBlogSection" }),
      Content.findOne({ section: "ourEducationContent" }),
    ]);

    // Run these image lookups in parallel if config exists
    let headerImage = null,
      footerImage = null,
      bannerImage = null;

    if (config) {
      const imageIds = [
        config.headerImageId,
        config.footerImageId,
        config.bannerImageId,
      ].filter((id) => id); // filter out undefined/null

      const images = await Image.find({ _id: { $in: imageIds } });

      // Map images by id for quick lookup
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
      bannerImage = config.bannerImageId
        ? imageMap[config.bannerImageId.toString()]
        : null;
    }

    // Run these queries in parallel
    const [
      PlacementImages,
      galleryImages,
      faqs,
      educationImages,
      placementStudentImages,
      reviews,
    ] = await Promise.all([
      otherImages.find({ section: "placement" }),
      galleryController.getGalleryImages(),
      Faq.find(),
      educationController.geteducationImages(),
      placementStudentsController.getplacementStudentsImages(),
      reviewModel.find(),
    ]);

    res.render("admin/admin-home", {
      currentPath: req.path,
      currentPath: req.path,
      currentContent: homepageContent?.html || "",
      contentAboveForm: contentAboveForm?.html || "",
      placementContent: placementContent?.html || "",
      homeYoutubeLink: homeYoutubeLink?.html || "",
      whyChooseUs: whyChooseUs?.html || "",
      contentBesideYoutube: contentBesideYoutube?.html || "",
      ourCoursesContent: ourCoursesContent?.html || "",
      ourEventsContent: ourEventsContent?.html || "",
      contentBelowGallery: contentBelowGallery?.html || "",
      ourCollegesContent: ourCollegesContent?.html || "",
      studentReviewContent: studentReviewContent?.html || "",
      contentStarStudent: contentStarStudent?.html || "",
      homeLoctionContent: homeLoctionContent?.html || "",
      faqHeading: faqHeading?.html || "",
      homeMetaHeading: homeMetaHeading?.html || "",
      homeMetaDescription: homeMetaDescription?.html || "",
      homeMetaKeyword: homeMetaKeyword?.html || "",
      homeBlogSection: homeBlogSection?.html || "",
      ourEducationContent: ourEducationContent?.html || "",
      headerImageUrl: headerImage?.url || "/simpleImage.png",
      footerImageUrl: footerImage?.url || "/simpleImage.png",
      bannerImageUrl: bannerImage?.url || "/simpleImage.png",
      PlacementImages,
      galleryImages,
      educationImages,
      placementStudentImages,
      reviews,
      faqs,
    });
  } catch (err) {
        next(err)

  }
};
