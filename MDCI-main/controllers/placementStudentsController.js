const path = require('path');
const fs = require('fs');
const multer = require('multer');
const placementStudentsImage = require('../models/otherImages');

// Ensure the uploads/placementStudents folder exists
const placementStudentsUploadPath = path.join(__dirname, '../public/uploads/placementStudents');
if (!fs.existsSync(placementStudentsUploadPath)) {
  fs.mkdirSync(placementStudentsUploadPath, { recursive: true });
}

// Multer storage configuration
const placementStudentsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, placementStudentsUploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

// Multer upload middleware for placementStudents images (export this)
exports.placementStudentsUpload = multer({ storage: placementStudentsStorage });

// Upload multiple placementStudents images handler
exports.uploadplacementStudentsImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded');
    }

    // Save each uploaded file record in MongoDB
    for (const file of files) {
      await placementStudentsImage.create({
        imagePath: `/uploads/placementStudents/${file.filename}`,
        section: 'placementStudents', // distinguish from other sections
      });
    }

    res.redirect('/edit-page');
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Error uploading images');
  }
};

// Delete placementStudents image handler
exports.deleteplacementStudentsImage = async (req, res) => {
  try {
    const image = await placementStudentsImage.findById(req.params.id);
    if (!image) return res.status(404).send('Image not found');

    // Construct full path to image file
    const fullPath = path.join(__dirname, '../public', image.imagePath);

    // Delete file from filesystem
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });

    // Delete record from MongoDB
    await image.deleteOne();

    res.redirect('/edit-page');
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).send('Error deleting image');
  }
};

// Get all placementStudents images (for rendering etc.)
exports.getplacementStudentsImages = async () => {
  return await placementStudentsImage.find({ section: 'placementStudents' });
};
