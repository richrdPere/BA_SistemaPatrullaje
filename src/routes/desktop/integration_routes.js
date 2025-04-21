const express = require("express");
const router = express.Router();
const integrationController = require("../../controllers/desktop/integration_controller");

// Rutas para integraciones externas
router.get("/pnp-incidents", integrationController.getPNPIncidents);
router.get("/cctv-feed", integrationController.getCCTVFeed);
router.post("/send-alert", integrationController.sendEmergencyAlert);

module.exports = router;
