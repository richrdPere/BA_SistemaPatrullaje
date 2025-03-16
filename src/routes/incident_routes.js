const express = require("express");
const router = express.Router();
const incidentController = require("../controllers/incidents_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Ruta para registrar un nuevo incidente
router.post("/", verifyToken, incidentController.createIncident);

// Ruta para obtener todos los incidentes
router.get("/", verifyToken, incidentController.getAllIncidents);

// Ruta para obtener un incidente por ID
router.get("/:id", verifyToken, incidentController.getIncidentById);

// Ruta para actualizar un incidente
router.put("/:id", verifyToken, incidentController.updateIncident);

// Ruta para eliminar un incidente
router.delete("/:id", [verifyToken, isAdmin], incidentController.deleteIncident);

module.exports = router;
