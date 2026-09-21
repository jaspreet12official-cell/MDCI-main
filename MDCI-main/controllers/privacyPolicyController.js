const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");




exports.getAdminprivacyPolicySection = async (req, res) => {
  try {
    const [
      siteConfig,
      privacyPolicyMetaHeading,
      privacyPolicyMetaDescription,
      privacyPolicyMetaKeyword,
      privacyPolicySection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "privacyPolicyMetaHeading" }),
      Content.findOne({ section: "privacyPolicyMetaDescription" }),
      Content.findOne({ section: "privacyPolicyMetaKeyword" }),
      Content.findOne({ section: "privacyPolicySection" }),
    ]);

    res.render("admin/admin-privacyPolicy", {
      currentPath: req.path,
      siteConfig,
      privacyPolicyMetaHeading: privacyPolicyMetaHeading?.html || "",
      privacyPolicyMetaDescription: privacyPolicyMetaDescription?.html || "",
      privacyPolicyMetaKeyword: privacyPolicyMetaKeyword?.html || "",
      privacyPolicySection: privacyPolicySection?.html || "",
    });
  } catch (err) {
        next(err)

  }
};
exports.getprivacyPolicySection = async (req, res) => {
  try {
    const [
      siteConfig,
      privacyPolicyMetaHeading,
      privacyPolicyMetaDescription,
      privacyPolicyMetaKeyword,
      privacyPolicySection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "privacyPolicyMetaHeading" }),
      Content.findOne({ section: "privacyPolicyMetaDescription" }),
      Content.findOne({ section: "privacyPolicyMetaKeyword" }),
      Content.findOne({ section: "privacyPolicySection" }),
    ]);

    res.render("privacyPolicy", {
      currentPath: req.path,
      siteConfig,
      privacyPolicyMetaHeading: privacyPolicyMetaHeading?.html || "",
      privacyPolicyMetaDescription: privacyPolicyMetaDescription?.html || "",
      privacyPolicyMetaKeyword: privacyPolicyMetaKeyword?.html || "",
      privacyPolicySection: privacyPolicySection?.html || "",
    });
  } catch (err) {
        next(err)

  }
};

