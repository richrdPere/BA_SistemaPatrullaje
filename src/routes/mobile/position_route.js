const express = require("express");
const router = express.Router();
const positionController = require("../../controllers/mobile/position_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Ruta para enviar nueva posición
router.post("/", verifyToken, positionController.updatePosition);

// Ruta para obtener última posición de un sereno
router.get("/:serenoId", verifyToken, positionController.getPosition);

module.exports = router;
