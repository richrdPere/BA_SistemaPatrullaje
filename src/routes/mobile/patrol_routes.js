const express = require("express");
const router = express.Router();
const patrolController = require("../../controllers/mobile/patrol_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para registrar un nuevo patrullaje
router.post("/", verifyToken, patrolController.createRoutePatrol);

// Ruta para obtener todos los patrullajes
router.get("/", verifyToken, patrolController.getRoutesPatrol);

// Ruta para obtener un patrullaje por ID
router.get("/:id", verifyToken, patrolController.getRoutePatrolById);

// Ruta para actualizar un patrullaje
router.put("/:id", verifyToken, patrolController.updateRoutePatrol);

// Ruta para eliminar un patrullaje
router.delete("/:id", [verifyToken, isAdmin], patrolController.deleteRoutePatrol);

module.exports = router;