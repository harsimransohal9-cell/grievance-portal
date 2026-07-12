const Complaint = require("../models/Complaint");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Create a complaint (student)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const complaint = await Complaint.create({
      title,
      description,
      category: category || "other",
      photoUrl,
      student: req.user._id,
    });

    // Notify all admins that a new complaint was filed
    const admins = await User.find({ role: "admin" }).select("email");
    const adminEmails = admins.map((a) => a.email);

    if (adminEmails.length > 0) {
      sendEmail({
        to: adminEmails.join(","),
        subject: `New Complaint Filed: ${title}`,
        text: `A new complaint has been filed by ${req.user.name} (${req.user.email}).\n\nTitle: ${title}\nCategory: ${category || "other"}\nDescription: ${description}\n\nPlease log in to the admin dashboard to review it.`,
      });
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating complaint" });
  }
};

// Get logged-in student's own complaints
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching your complaints" });
  }
};

// Get all complaints (admin) - supports ?status=pending&category=hostel filters
const getAllComplaints = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const complaints = await Complaint.find(filter)
      .populate("student", "name email department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching complaints" });
  }
};

// Get single complaint by id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "student",
      "name email department"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "student" && complaint.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching complaint" });
  }
};

// Update complaint status (admin)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "in-progress", "resolved"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const complaint = await Complaint.findById(req.params.id).populate("student", "name email");
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.resolvedAt = status === "resolved" ? new Date() : null;
    if (status !== "pending") complaint.escalated = false;

    await complaint.save();

    // Notify the student whenever status changes
    if (complaint.student?.email) {
      const statusLabel = {
        pending: "Pending",
        "in-progress": "In Progress",
        resolved: "Resolved",
      }[status];

      sendEmail({
        to: complaint.student.email,
        subject: `Your Complaint Status Updated: ${statusLabel}`,
        text: `Hi ${complaint.student.name},\n\nYour complaint "${complaint.title}" has been updated to: ${statusLabel}.\n\n${
          status === "resolved"
            ? "Thank you for your patience. If the issue persists, feel free to file a new complaint."
            : "We're working on it. You'll be notified of any further updates."
        }\n\n- Campus Grievance Portal`,
      });
    }

    res.json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating status" });
  }
};

// Manual escalation trigger (useful for live demo)
const triggerEscalation = async (req, res) => {
  try {
    const { runEscalationCheck } = require("../utils/escalationCron");
    await runEscalationCheck();
    res.json({ message: "Escalation check completed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while running escalation check" });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  triggerEscalation,
};