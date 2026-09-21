const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

const protect = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next(); // Admin is logged in
  } else {
    return res.redirect("/admin-login"); // Redirect to login if not authenticated
  }
};
module.exports = protect;
