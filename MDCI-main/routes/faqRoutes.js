const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const protect = require("../middleware/authMiddleware");


router.get('/edit-page',protect, faqController.renderFAQPage);
router.post('/admin/faqs/add', faqController.addFAQ);
router.post('/admin/faqs/edit/:id', faqController.editFAQ);
router.post('/admin/faqs/delete/:id', faqController.deleteFAQ);

module.exports = router;
