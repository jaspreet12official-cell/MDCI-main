const path = require('path');
const fs = require('fs');
const PlacementPartner = require('../models/otherImages'); // Adjust path if needed

// Upload multiple placement images
exports.uploadPlacementImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files uploaded.');
    }

    const placementImages = req.files.map(file => ({
      imagePath: `/uploads/placement/${file.filename}`,
      section: 'placement'
    }));

    await PlacementPartner.insertMany(placementImages);

    res.redirect('/');
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).send('Upload failed');
  }
};

// Delete a placement image by ID
exports.deletePlacementImage = async (req, res) => {
  try {
    const image = await PlacementPartner.findById(req.params.id);
    if (!image) return res.status(404).send('Image not found');

    // Build full file path safely
    const fullPath = path.join(__dirname, '..', 'public', image.imagePath);

    fs.unlink(fullPath, err => {
      if (err) console.error('Failed to delete file:', err);
    });

    await PlacementPartner.findByIdAndDelete(req.params.id);

    res.redirect('/edit-page');
  } catch (error) {
    console.error('Delete failed:', error);
    res.status(500).send('Delete failed');
  }
};
