const express = require("express");
const router = express.Router();
const routesAssignmentController = require("../../controllers/desktop/routeAssignment_controller");

// Rutas para la gestión de incidentes por administradores
router.post("/", routesAssignmentController.assignRoute);


module.exports = router;
