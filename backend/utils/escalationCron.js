const cron = require("node-cron");
const Complaint = require("../models/Complaint");

const ESCALATION_THRESHOLD_DAYS = parseInt(process.env.ESCALATION_DAYS || "3", 10);

const runEscalationCheck = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ESCALATION_THRESHOLD_DAYS);

    const result = await Complaint.updateMany(
      {
        status: "pending",
        escalated: false,
        createdAt: { $lte: cutoffDate },
      },
      { $set: { escalated: true } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[Escalation] ${result.modifiedCount} complaint(s) auto-escalated`);
    }
  } catch (error) {
    console.error("[Escalation] Error running escalation check:", error.message);
  }
};

const startEscalationCron = () => {
  cron.schedule("0 0 * * *", runEscalationCheck); // runs daily at midnight
  console.log("Escalation cron job scheduled (runs daily at midnight)");
};

module.exports = { startEscalationCron, runEscalationCheck };