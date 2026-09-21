const Image = require('../models/Image');
const SiteConfig = require('../models/SiteConfig');
const fs = require('fs');
const path = require('path');

// Upload and replace header/footer/banner image
exports.uploadImage = async (req, res) => {
  try {
    const { role } = req.body;

    if (!req.file) return res.status(400).send('No file uploaded.');
    if (!['header', 'footer', 'banner'].includes(role)) return res.status(400).send('Invalid role.');

    // Save new image in DB
    const newImage = new Image({
      url: '/uploads/' + req.file.filename,
    });
    await newImage.save();

    // Load or create config
    let config = await SiteConfig.findOne();
    if (!config) config = new SiteConfig();

    // Helper to delete old image if exists
    const deleteOldImage = async (imageId) => {
      const oldImage = await Image.findById(imageId);
      if (oldImage) {
        const oldImagePath = path.join(__dirname, '../public', oldImage.url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        await oldImage.deleteOne();
      }
    };

    // Replace image by role
    if (role === 'header') {
      await deleteOldImage(config.headerImageId);
      config.headerImageId = newImage._id;
    } else if (role === 'footer') {
      await deleteOldImage(config.footerImageId);
      config.footerImageId = newImage._id;
    } else if (role === 'banner') {
      await deleteOldImage(config.bannerImageId);
      config.bannerImageId = newImage._id;
    }

    await config.save();
    res.redirect('/edit-page');
  } catch (err) {
        next(err)

  }
};

// Page to render image upload form
exports.renderImageUploadPage = (req, res) => {
  res.render('admin',{currentPath: req.path,}); // make sure upload-image.ejs exists in /views
};
