const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report_controller");

// Rutas para reportes
router.get("/incidents", reportController.getIncidentReports);
router.get("/routes", reportController.getRouteReports);
router.get("/serenos", reportController.getSerenoReports);
router.get("/incidents/export/csv", reportController.exportIncidentReportsCSV);

module.exports = router;
