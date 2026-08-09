const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createComplaint, getMyComplaints } = require("../controllers/complaintController");

router.use(protect);
router.post("/", createComplaint);
router.get("/mine", getMyComplaints);

module.exports = router;
