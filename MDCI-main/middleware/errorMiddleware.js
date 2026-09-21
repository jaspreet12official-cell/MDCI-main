const notFound = (req, res, next) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    errorCode: 404,
    errorMessage: "The page you are looking for does not exist.",
    currentPath: req.originalUrl,
    error: {},
  });
};

const errorHandler = (err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  const isAdmin = req.originalUrl.startsWith("/admin");
  const view = isAdmin ? "admin/error" : "error";

  res.status(500).render(view, {
    title: isAdmin ? "Admin Error" : "Error",
    errorCode: 500,
    errorMessage: err.message || "Something went wrong!",
    currentPath: req.originalUrl,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
};

module.exports = { notFound, errorHandler };
