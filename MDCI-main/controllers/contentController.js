const Content = require('../models/Content');

exports.updateContent = async (req, res) => {
  try {
    const { section, content, redirectTo } = req.body;
    console.log('BODY:', req.body);

    let pageContent = await Content.findOne({ section });
    if (!pageContent) {
      console.log('Creating new content');
      pageContent = new Content({ section, html: content });
    } else {
      console.log('Updating existing content');
      pageContent.html = content;
    }

    await pageContent.save();
    console.log('Saved successfully:', pageContent);

    res.redirect(redirectTo || '/edit-page');
  } catch (err) {
    next(err)
  }
};
