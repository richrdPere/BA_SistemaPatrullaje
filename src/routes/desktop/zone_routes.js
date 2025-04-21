const express = require("express");
const router = express.Router();
const zoneController = require("../../controllers/desktop/zones_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para registrar una nueva zona de patrullaje
router.post("/", verifyToken, zoneController.createZone);

// Ruta para obtener todas las zonas de patrullaje
router.get("/", verifyToken, zoneController.getAllZones);

// Ruta para obtener una zona de patrullaje por ID
router.get("/:id", verifyToken, zoneController.getZoneById);

// Ruta para actualizar una zona de patrullaje
router.put("/:id", verifyToken, zoneController.updateZone);

// Ruta para eliminar una zona de patrullaje
router.delete("/:id", [verifyToken, isAdmin], zoneController.deleteZone);

module.exports = router;