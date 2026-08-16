const Complaint = require("../models/Complaint");
const sendEmail = require("../utils/sendEmail");

const CATEGORY_LABELS = {
  fraud: "Fraud",
  payment: "Payment issue",
  quality: "Quality issue",
  delivery: "Delivery issue",
  account: "Account issue",
  other: "Other",
};

// Fire-and-forget: emails the site's contact inbox whenever someone files a
// complaint or sends a message via the Contact page. Never throws back to
// the request handler -- a failed notification email should not stop the
// complaint from being saved.
const notifyContactInbox = async (complaint, user) => {
  try {
    const to = process.env.CONTACT_EMAIL || "services@piarapakistan.com";
    await sendEmail(
      to,
      `New message: ${complaint.subject}`,
      `<h2>New message from PiaraPakistan (Contact / Help Center)</h2>
       <p><strong>${user.firstName} ${user.lastName}</strong> (${user.role}) sent a message.</p>
       <ul>
         <li>Email: ${user.email}</li>
         <li>Phone: ${user.phone}</li>
         <li>Category: ${CATEGORY_LABELS[complaint.category] || complaint.category}</li>
       </ul>
       <p><strong>Subject:</strong> ${complaint.subject}</p>
       <p><strong>Message:</strong><br/>${complaint.message}</p>
       <p>Reply from the Admin Panel &rarr; Complaints, or reply directly to ${user.email}.</p>
       <p>&mdash; PiaraPakistan system</p>`
    );
  } catch (err) {
    console.error("[Contact notify] Failed to send contact email:", err.message);
  }
};

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

    notifyContactInbox(complaint, req.user);

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
