const FAQ = require('../models/FAQ');

// Render FAQ management page
exports.renderFAQPage = async (req, res) => {
  const faqs = await FAQ.find();
  res.render('admin', { faqs, currentPath: req.path, });
};

// Add new FAQ
exports.addFAQ = async (req, res) => {
  const { question, answer } = req.body;
  await FAQ.create({ question, answer });
  res.redirect('/edit-page');
};

// Edit existing FAQ
exports.editFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  await FAQ.findByIdAndUpdate(id, { question, answer });
  res.redirect('/edit-page');
};

// Delete FAQ
exports.deleteFAQ = async (req, res) => {
  const { id } = req.params;
  await FAQ.findByIdAndDelete(id);
  res.redirect('/edit-page');
};
