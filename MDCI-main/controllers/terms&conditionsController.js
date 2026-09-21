const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");

exports.getAdminTermsConditionsSection = async (req, res) => {
  try {
    const [
      siteConfig,
      termsConditionsMetaHeading,
      termsConditionsMetaDescription,
      termsConditionsMetaKeyword,
      termsConditionsSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "termsConditionsMetaHeading" }),
      Content.findOne({ section: "termsConditionsMetaDescription" }),
      Content.findOne({ section: "termsConditionsMetaKeyword" }),
      Content.findOne({ section: "termsConditionsSection" }),
    ]);

    res.render("admin/admin-terms&conditions", {
      currentPath: req.path,
      termsConditionsMetaHeading: termsConditionsMetaHeading?.html || "",
      termsConditionsMetaDescription:
        termsConditionsMetaDescription?.html || "",
      termsConditionsMetaKeyword: termsConditionsMetaKeyword?.html || "",
      termsConditionsSection: termsConditionsSection?.html || "",
      siteConfig,
    });
  } catch (err) {
        next(err)

  }
};

exports.getTermsConditionsSection = async (req, res) => {
  try {
    const [
      siteConfig,
      termsConditionsMetaHeading,
      termsConditionsMetaDescription,
      termsConditionsMetaKeyword,
      termsConditionsSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "termsConditionsMetaHeading" }),
      Content.findOne({ section: "termsConditionsMetaDescription" }),
      Content.findOne({ section: "termsConditionsMetaKeyword" }),
      Content.findOne({ section: "termsConditionsSection" }),
    ]);

    res.render("terms&conditions", {
      currentPath: req.path,
      termsConditionsMetaHeading: termsConditionsMetaHeading?.html || "",
      termsConditionsMetaDescription:
        termsConditionsMetaDescription?.html || "",
      termsConditionsMetaKeyword: termsConditionsMetaKeyword?.html || "",
      termsConditionsSection: termsConditionsSection?.html || "",
      siteConfig,
    });
  } catch (err) {
        next(err)

  }
};
