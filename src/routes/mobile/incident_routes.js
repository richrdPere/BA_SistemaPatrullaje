const express = require("express");
const router = express.Router();
const incidentController = require("../../controllers/mobile/incident_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para registrar un nuevo incidente
router.post("/register", verifyToken, incidentController.registerIncident);

// Ruta para obtener todos los incidentes
router.get("/", verifyToken, incidentController.getAllIncidents);

// Ruta para obtener un incidente por ID
router.get("/:incidentId", verifyToken, incidentController.getIncident);

// Ruta para actualizar un incidente
// router.put("/:id", verifyToken, incidentController.updateIncident);

// Ruta para eliminar un incidente
router.delete("/:incidentId", [verifyToken, isAdmin], incidentController.removeIncident);

module.exports = router;
