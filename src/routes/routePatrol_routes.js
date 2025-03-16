const express = require("express");
const router = express.Router();
const patrolRouteController = require("../controllers/routesPatrol_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Ruta para registrar una nueva ruta de patrullaje
router.post("/", verifyToken, patrolRouteController.createPatrolRoute);

// Ruta para obtener todas las rutas de patrullaje
router.get("/", verifyToken, patrolRouteController.getAllPatrolRoutes);

// Ruta para obtener una ruta de patrullaje por ID
router.get("/:id", verifyToken, patrolRouteController.getPatrolRouteById);

// Ruta para actualizar una ruta de patrullaje
router.put("/:id", verifyToken, patrolRouteController.updatePatrolRoute);

// Ruta para eliminar una ruta de patrullaje
router.delete("/:id", [verifyToken, isAdmin], patrolRouteController.deletePatrolRoute);

module.exports = router;
