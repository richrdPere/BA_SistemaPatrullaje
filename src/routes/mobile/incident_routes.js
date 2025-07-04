const express = require("express");
const router = express.Router();
const incidentController = require("../../controllers/mobile/incident_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// 1. Registrar incidente
router.post('/', verifyToken, incidentController.registerIncident);

// 2. Obtener todos los incidentes
router.get('/', verifyToken, incidentController.getAllIncidents);

//  3. Filtrar incidentes
router.get('/filtrar', verifyToken, incidentController.filterIncidents);

//  4. Incidentes por sereno
router.get('/sereno/:serenoId', verifyToken, incidentController.getIncidentsBySereno);

//  5. Actualizar estado, tipo o prioridad
router.patch('/:incidentId/actualizar', verifyToken, incidentController.updateIncidentFields);

//  6. Obtener incidente por ID
router.get('/:incidentId', verifyToken, incidentController.getIncidentByID);

//  7. Eliminar incidente
router.delete('/:incidentId', verifyToken, incidentController.removeIncident);

module.exports = router;
