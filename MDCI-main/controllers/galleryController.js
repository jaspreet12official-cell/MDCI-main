const path = require('path');
const fs = require('fs');
const multer = require('multer');
const GalleryImage = require('../models/otherImages');

// Ensure the uploads/gallery folder exists
const galleryUploadPath = path.join(__dirname, '../public/uploads/gallery');
if (!fs.existsSync(galleryUploadPath)) {
  fs.mkdirSync(galleryUploadPath, { recursive: true });
}

// Multer storage configuration
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryUploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

// Multer upload middleware for gallery images (export this)
exports.galleryUpload = multer({ storage: galleryStorage });

// Upload multiple gallery images handler
exports.uploadGalleryImages = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).send('No files uploaded');
    }

    // Save each uploaded file record in MongoDB
    for (const file of files) {
      await GalleryImage.create({
        imagePath: `/uploads/gallery/${file.filename}`,
        section: 'gallery', // distinguish from other sections
      });
    }

    res.redirect('/edit-page');
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Error uploading images');
  }
};

// Delete gallery image handler
exports.deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findById(req.params.id);
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

// Get all gallery images (for rendering etc.)
exports.getGalleryImages = async () => {
  return await GalleryImage.find({ section: 'gallery' });
};
