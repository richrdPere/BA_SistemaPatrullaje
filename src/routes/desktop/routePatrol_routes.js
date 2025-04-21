const express = require("express");
const router = express.Router();
const patrolRouteController = require("../../controllers/desktop/routePatrol_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para registrar una nueva ruta de patrullaje
router.post("/", verifyToken, patrolRouteController.createRoutePatrol);

// Ruta para obtener todas las rutas de patrullaje
router.get("/", verifyToken, patrolRouteController.getRoutesPatrol);

// Ruta para obtener una ruta de patrullaje por ID
router.get("/:id", verifyToken, patrolRouteController.getRoutePatrolById);

// Ruta para actualizar una ruta de patrullaje
router.put("/:id", verifyToken, patrolRouteController.updateRoutePatrol);

// Ruta para eliminar una ruta de patrullaje
router.delete("/:id", [verifyToken, isAdmin], patrolRouteController.deleteRoutePatrol);

module.exports = router;
