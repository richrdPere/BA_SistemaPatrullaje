const express = require("express");
const router = express.Router();
const patrolRouteController = require("../../controllers/desktop/routePatrol_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para registrar una nueva ruta de patrullaje
router.post("/create_route", verifyToken, patrolRouteController.createRoutePatrol);

// Ruta para asignar serenos
router.put("/assign_serenazgos", verifyToken, patrolRouteController.assignSerenazgosToRoute);

// Ruta para actualizar una ruta de patrullaje
router.put("/:routeId", verifyToken, patrolRouteController.updateRoute);

// Ruta para obtener todas las rutas creadas
router.get("/", verifyToken, patrolRouteController.getRoutes);

// Ruta para obtener rutas por ID
router.get("/:id", [verifyToken, isAdmin], patrolRouteController.getRouteById);

module.exports = router;
