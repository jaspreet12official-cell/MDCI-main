// routes/bannerInquiryRoutes.js
const express = require("express");
const router = express.Router();
const BannerInquiry = require("../models/BannerInquiry");
const protect = require("../middleware/authMiddleware");


// View all inquiries
router.get("/admin/counsel-list",protect, async (req, res) => {
  const inquiries = await BannerInquiry.find().sort({ createdAt: -1 });
  res.render("admin/counsel-list", { inquiries, currentPath: req.path, });
});

router.post("/banner-inquiry", async (req, res) => {
  try {
    const { fullName, phone, courseChoice } = req.body;

    await BannerInquiry.create({
      fullName,
      phone,
      courseChoice,
    });

    res.redirect("/"); // redirect to home after submission
  } catch (err) {
        next(err)

  }
});

module.exports = router;
