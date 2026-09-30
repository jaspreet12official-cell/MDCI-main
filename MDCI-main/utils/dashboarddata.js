// ======================================================================
// dashboardData.js
// Builds: categories, activities, enrollmentTrend for the admin dashboard.
// Uses the EXACT field names from your models:
//   Course           -> category
//   Enrollment       -> fullName, courseChoice, createdAt
//   ContactInquiry   -> name, createdAt
//
// USAGE (inside controllers/dashboardController.js):
//
//   const Course = require("../models/Course");
//   const Enrollment = require("../models/Enrollment");
//   const ContactInquiry = require("../models/ContactInquiry");
//   const { getCategories, getActivities, getEnrollmentTrend } = require("../utils/dashboardData");
//
//   exports.getAdminDashboard = async (req, res) => {
//     // ...your existing stats code stays exactly as is...
//
//     const categories = await getCategories(Course);
//     const activities = await getActivities(Enrollment, ContactInquiry);
//     const enrollmentTrend = await getEnrollmentTrend(Enrollment);
//
//     res.render("admin/dashboard", {
//       stats, headerImageUrl,   // whatever you already pass
//       categories, activities, enrollmentTrend,
//     });
//   };
// ======================================================================

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " hr ago";
  return Math.floor(s / 86400) + " days ago";
}

// ----------------------------------------------------------------------
// 1) Courses by Category (Course.category)
// ----------------------------------------------------------------------
async function getCategories(Course) {
  if (!Course) return [];
  try {
    const agg = await Course.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return agg
      .filter((c) => c._id)
      .map((c) => ({ name: c._id, count: c.count }));
  } catch (err) {
    console.error("getCategories error:", err.message);
    return [];
  }
}

// ----------------------------------------------------------------------
// 2) Recent Activity: Enrollment (fullName, courseChoice) +
//    ContactInquiry (name)
// ----------------------------------------------------------------------
async function getActivities(Enrollment, ContactInquiry, limit = 6) {
  const items = [];

  try {
    if (Enrollment) {
      const docs = await Enrollment.find().sort({ createdAt: -1 }).limit(limit).lean();
      docs.forEach((d) => {
        items.push({
          name: d.fullName || "Someone",
          text: "requested enrollment in",
          link: d.courseChoice || "",
          time: timeAgo(d.createdAt),
          _d: new Date(d.createdAt),
        });
      });
    }
  } catch (err) {
    console.error("getActivities (enrollment) error:", err.message);
  }

  try {
    if (ContactInquiry) {
      const docs = await ContactInquiry.find().sort({ createdAt: -1 }).limit(limit).lean();
      docs.forEach((d) => {
        items.push({
          name: d.name || "Someone",
          text: "sent a Get In Touch enquiry",
          link: "",
          time: timeAgo(d.createdAt),
          _d: new Date(d.createdAt),
        });
      });
    }
  } catch (err) {
    console.error("getActivities (contact) error:", err.message);
  }

  return items
    .sort((a, b) => b._d - a._d)
    .slice(0, limit)
    .map(({ _d, ...rest }) => rest);
}

// ----------------------------------------------------------------------
// 3) Overview Trend: enrollment requests per month, last 6 months
// ----------------------------------------------------------------------
async function getEnrollmentTrend(Enrollment) {
  if (!Enrollment) return null;

  const from = new Date();
  from.setMonth(from.getMonth() - 5);
  from.setDate(1);
  from.setHours(0, 0, 0, 0);

  try {
    const agg = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]);

    const labels = [];
    const data = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
      labels.push(d.toLocaleString("en", { month: "short" }));
      const hit = agg.find(
        (t) => t._id.y === d.getFullYear() && t._id.m === d.getMonth() + 1
      );
      data.push(hit ? hit.count : 0);
    }

    return { name: "Enrollment Requests", labels, data };
  } catch (err) {
    console.error("getEnrollmentTrend error:", err.message);
    return null;
  }
}

module.exports = { getCategories, getActivities, getEnrollmentTrend, timeAgo };