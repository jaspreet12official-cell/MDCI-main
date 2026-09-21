const StudentReview = require('../models/StudentReview');

exports.getStudentReviews = async (req, res) => {
  try {
    const reviews = await StudentReview.find();
    res.render('admin', { reviews,currentPath: req.path, });
  } catch (err) {
    console.error('Get Review Error:', err);
    res.status(500).send('Server Error');
  }
};

exports.addStudentReview = async (req, res) => {
  try {
    const { name, position, review , rating} = req.body;    
    const imagePath = req.file ? '/uploads/reviews/' + req.file.filename : '';

    const newReview = new StudentReview({ name, position, review, imagePath , rating: Number(rating)});
    await newReview.save();

    res.redirect('/edit-page');
  } catch (err) {
        next(err)

  }
};

exports.deleteStudentReview = async (req, res) => {
  try {
    await StudentReview.findByIdAndDelete(req.params.id);
    res.redirect('/edit-page');
  } catch (err) {
        next(err)

  }
};
