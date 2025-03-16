const express = require("express");
const router = express.Router();
const patrolController = require("../controllers/patrols_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Ruta para registrar un nuevo patrullaje
router.post("/", verifyToken, patrolController.createPatrol);

// Ruta para obtener todos los patrullajes
router.get("/", verifyToken, patrolController.getAllPatrols);

// Ruta para obtener un patrullaje por ID
router.get("/:id", verifyToken, patrolController.getPatrolById);

// Ruta para actualizar un patrullaje
router.put("/:id", verifyToken, patrolController.updatePatrol);

// Ruta para eliminar un patrullaje
router.delete("/:id", [verifyToken, isAdmin], patrolController.deletePatrol);

module.exports = router;