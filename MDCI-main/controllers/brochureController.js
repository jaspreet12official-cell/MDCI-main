const express = require('express');
const fs = require('fs');
const path = require('path');

module.exports = function(upload, uploadPath) {
  const router = express.Router();

  const brochurePath = path.join(uploadPath, 'brochure.pdf');

  // Route to upload brochure PDF
  router.post('/upload-brochure', upload.single('brochure'), (req, res) => {
    if (!req.file) {
      console.log('No brochure file uploaded');
      return res.status(400).send('No file uploaded');
    }

    const tempPath = req.file.path;

    try {
      if (fs.existsSync(brochurePath)) {
        fs.unlinkSync(brochurePath);
        console.log('Old brochure deleted');
      }
    } catch (err) {
      next(err);
    }

    // Rename uploaded file to fixed name 'brochure.pdf'
    fs.rename(tempPath, brochurePath, (err) => {
      if (err) {
        console.error('Error renaming brochure:', err);
        return res.status(500).send('Error updating brochure');
      }
      console.log('Brochure replaced successfully');
      res.redirect('/edit-page');
    });
  });

  return router;
};
