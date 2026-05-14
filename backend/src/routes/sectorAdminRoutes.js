const express = require("express");
const router = express.Router();
const {
  // Public routes
  getPublicSectors,
  getPublicSectorById,
  // Admin routes
  getAllSectors,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
  toggleSectorStatus,
  getSectorStats,
  upload, // ← ADD THIS IMPORT
} = require("../controllers/sectorAdminController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// ============= PUBLIC ROUTES (No Auth) =============
router.get("/", getPublicSectors);
router.get("/public/:id", getPublicSectorById);

// ============= ADMIN ROUTES (Auth Required) =============
router.use(protect);

// Stats
router.get("/stats", getSectorStats);

// CRUD operations
router.get("/admin/all", getAllSectors);
router.get("/admin/:id", getSectorById);
router.post("/admin", upload.single("image"), createSector); // ← ADD upload.single("image")
router.put("/admin/:id", upload.single("image"), updateSector); // ← ADD upload.single("image")
router.delete("/admin/:id", superAdminOnly, deleteSector);
router.patch("/admin/:id/toggle", toggleSectorStatus);

module.exports = router;
