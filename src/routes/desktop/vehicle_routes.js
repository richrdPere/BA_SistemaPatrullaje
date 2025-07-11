const express = require("express");
const router = express.Router();
const vehicleController = require("../../controllers/desktop/vehicle_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// 1.- Registrar una nuevo vehiculo
router.post('/', verifyToken, vehicleController.createVehicle);

// 2.- Obtener todos los vehiculos
router.get('/vehiculos', verifyToken, vehicleController.getAllVehicles);

// 3.- Filtrar Vehiculos por Tipo, Estado y Uso
router.get('/filter', verifyToken, vehicleController.filterVehicles);

// 4.- Obtener vehiculo por ID
router.get('/:vehiculoId', verifyToken, vehicleController.getVehicleById);

// 5.- Actualizar vehiculo
router.put('/:vehiculoId', verifyToken, vehicleController.updateVehicle);

// 6.- Eliminar vehiculo
router.delete('/:vehiculoId', verifyToken, vehicleController.deleteVehicle);

module.exports = router;