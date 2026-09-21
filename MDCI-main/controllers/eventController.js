const Event = require("../models/Event");

exports.renderEventForm = async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDate: -1 }); // ✅ Get all events
    res.render("admin/admin-event", { events, currentPath: req.path, });
  } catch (error) {
    console.error("Error rendering event form:", error);
    res.status(500).send("Internal Server Error");
  }
};


exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      eventDate,
      email,
      website,
      organiser,
      mapLocation,
      content,
      details,
      venue,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    const eventImage = req.file ? "/uploads/events/" + req.file.filename : "";

    const newEvent = new Event({
      name,
      eventDate,
      email,
      website,
      organiser,
      mapLocation,
      eventImage,
      content,
      details,
      venue,
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    await newEvent.save();
    res.redirect("/admin-event");
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.listEvents = async (req, res) => {
  const events = await Event.find().sort({ eventDate: -1 });
  res.render("event", { events, currentPath: req.path, });
};
exports.editEventForm = async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.render("admin/edit-event", { event,currentPath: req.path, });
};

exports.updateEvent = async (req, res) => {
  try {
    const {
      name,
      eventDate,
      email,
      website,
      organiser,
      mapLocation,
      content,
      details,
      venue,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = req.body;

    const update = {
      name,
      eventDate,
      email,
      website,
      organiser,
      mapLocation,
      content,
      details,
      venue,
      metaTitle,
      metaDescription,
      metaKeywords,
    };

    if (req.file) {
      update.eventImage = "/uploads/events/" + req.file.filename;
    }

    await Event.findByIdAndUpdate(req.params.id, update);
    res.redirect("/admin-event");
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.redirect("/admin-event");
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send("Internal Server Error");
  }
};
