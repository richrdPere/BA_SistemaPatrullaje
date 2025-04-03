const express = require("express");
const router = express.Router();
const incidentAdminController = require("../controllers/incidentAdmin_controller");

// Rutas para la gestión de incidentes por administradores
router.get("/", incidentAdminController.getAllIncidents);
router.put("/:incidentId/approve", incidentAdminController.approveIncident);
router.put("/:incidentId/reject", incidentAdminController.rejectIncident);
router.get("/summary", incidentAdminController.getIncidentSummary);

module.exports = router;
