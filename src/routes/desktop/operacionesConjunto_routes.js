const express = require("express");
const router = express.Router();
const OperacionesController = require("../../controllers/desktop/operacionesConjunto_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// 1.- Registrar una nueva operacion
router.post('/', verifyToken, OperacionesController.createJointOperation);

// 2.- Obtener todas las operaciones
router.get('/operaciones-conjuntas', verifyToken, OperacionesController.getAllJointOperations);

// 3.- Filtrar Operaciones por Entidad, Fecha
router.get('/filter', verifyToken, OperacionesController.filterJointOperations);

// 4.- Obtener Operacion por ID
router.get('/:operacionesId', verifyToken, OperacionesController.getJointOperationById);

// 5.- Actualizar operacion
router.put('/:operacionesId', verifyToken, OperacionesController.updateJointOperation);

// 6.- Eliminar operacion
router.delete('/:operacionesId', verifyToken, OperacionesController.deleteJointOperation);


module.exports = router;
