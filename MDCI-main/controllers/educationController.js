const path = require('path');
const fs = require('fs');
const multer = require('multer');
const educationImage = require('../models/otherImages');

// Ensure the uploads/education folder exists
const educationUploadPath = path.join(__dirname, '../public/uploads/education');
if (!fs.existsSync(educationUploadPath)) {
  fs.mkdirSync(educationUploadPath, { recursive: true });
}

// Multer storage configuration
const educationStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, educationUploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

// Multer upload middleware for education images (export this)
exports.educationUpload = multer({ storage: educationStorage });

// Upload multiple education images handler
exports.uploadeducationImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded');
    }

    // Save each uploaded file record in MongoDB
    for (const file of files) {
      await educationImage.create({
        imagePath: `/uploads/education/${file.filename}`,
        section: 'education', // distinguish from other sections
      });
    }

    res.redirect('/edit-page');
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Error uploading images');
  }
};

// Delete education image handler
exports.deleteeducationImage = async (req, res) => {
  try {
    const image = await educationImage.findById(req.params.id);
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

// Get all education images (for rendering etc.)
exports.geteducationImages = async () => {
  return await educationImage.find({ section: 'education' });
};
