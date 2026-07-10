const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  triggerEscalation,
} = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/my", protect, authorizeRoles("student"), getMyComplaints);
router.post("/run-escalation", protect, authorizeRoles("admin"), triggerEscalation);

router.post("/", protect, authorizeRoles("student"), upload.single("photo"), createComplaint);
router.get("/", protect, authorizeRoles("admin"), getAllComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id/status", protect, authorizeRoles("admin"), updateComplaintStatus);

module.exports = router;