const express = require("express");
const router = express.Router();
const trackingController = require("../controllers/tracking_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Rutas de seguimiento en tiempo real
router.post("/update", verifyToken, trackingController.updateLocation);
router.get("/:serenoId", verifyToken, trackingController.getLocation);
router.get("/all-locations", verifyToken, trackingController.getAllLocations);
router.delete("/:serenoId", verifyToken, trackingController.removeLocation);

module.exports = router;
