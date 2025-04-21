const express = require("express");
const router = express.Router();
const monitoringController = require("../../controllers/desktop/monitoring_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Rutas para la gestión de monitoreo
router.post("/createMonitoring", verifyToken, monitoringController.createMonitoring);
router.get("/", verifyToken, monitoringController.getMonitorings);
router.get("/:monitoringId", verifyToken, monitoringController.getMonitoringById);
router.delete("/:monitoringId", verifyToken, monitoringController.deleteMonitoring);

module.exports = router;
