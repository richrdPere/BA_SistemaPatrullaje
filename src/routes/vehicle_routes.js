const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicles_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Ruta para registrar un nuevo vehículo
router.post("/", verifyToken, vehicleController.createVehicle);

// Ruta para obtener todos los vehículos
router.get("/", verifyToken, vehicleController.getAllVehicles);

// Ruta para obtener un vehículo por ID
router.get("/:id", verifyToken, vehicleController.getVehicleById);

// Ruta para actualizar un vehículo
router.put("/:id", verifyToken, vehicleController.updateVehicle);

// Ruta para eliminar un vehículo
router.delete("/:id", [verifyToken, isAdmin], vehicleController.deleteVehicle);

module.exports = router;