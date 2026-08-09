const Complaint = require("../models/Complaint");
const sendEmail = require("../utils/sendEmail");

// POST /api/complaints - any logged-in user files a complaint
const createComplaint = async (req, res) => {
  try {
    const { subject, message, category, orderId, againstUserId } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: "Subject aur message zaroori hain" });
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      order: orderId || undefined,
      againstUser: againstUserId || undefined,
      subject,
      message,
      category: category || "other",
    });

    return res.status(201).json({ success: true, message: "Complaint darj ho gayi. Hum jaldi review karein ge.", complaint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error filing complaint" });
  }
};

// GET /api/complaints/mine
const getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ success: true, count: complaints.length, complaints });
};

module.exports = { createComplaint, getMyComplaints };
