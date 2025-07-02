const express = require("express");
const router = express.Router();
const zoneController = require("../../controllers/desktop/zone_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// 1.- Registrar una nueva zona de patrullaje
router.post("/", verifyToken, zoneController.createZone);

// 2.- Obtener todas las zonas de patrullaje
router.get("/zonas", verifyToken, zoneController.getAllZones);

// 3.- Obtener una zona de patrullaje por ID
router.get("/:zoneId", verifyToken, zoneController.getZoneById);

// 4.- Actualizar una zona de patrullaje
router.put("/:zoneId", verifyToken, zoneController.updateZone);

// 5.- Eliminar una zona de patrullaje
router.delete("/:zoneId", [verifyToken, isAdmin], zoneController.deleteZone);


module.exports = router;