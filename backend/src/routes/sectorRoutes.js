// backend/routes/sectorRoutes.js
// ================================================
// COMPLETE UPDATED ROUTES WITH ALL NEW ENDPOINTS
// ================================================

const express = require("express");
const router = express.Router();
const {
  getSectorFeedback,
  respondToFeedback,
  resolveFeedback,
  getSectorStats,
  exportCSV,
  updateProfile,
  changePassword,
  getPendingCount,
} = require("../controllers/sectorFeedbackController");
const { protect, sectorManagerOnly } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

// ============= FEEDBACK ROUTES =============
router.get("/:sectorId/feedback", sectorManagerOnly, getSectorFeedback);
router.get("/:sectorId/stats", sectorManagerOnly, getSectorStats);
router.get("/:sectorId/pending-count", sectorManagerOnly, getPendingCount);
router.get("/:sectorId/export/csv", sectorManagerOnly, exportCSV);
router.put("/feedback/:id/respond", sectorManagerOnly, respondToFeedback);
router.put("/feedback/:id/resolve", sectorManagerOnly, resolveFeedback);

// ============= PROFILE ROUTES =============
router.put("/profile/update", sectorManagerOnly, updateProfile);
router.put("/profile/change-password", sectorManagerOnly, changePassword);

module.exports = router;
