const express = require("express");
const router = express.Router();
const asignacionRutaController = require("../../controllers/desktop/asignacionRuta_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Rutas para la asignacion de zonas a los serenos por administradores

// 1.- Registrar la asignacion de zonas a los serenos
router.post("/", verifyToken, asignacionRutaController.assignRoute);

// 2.- Obtener todas las asignaciones de zonas a los serenos
router.get('/asignaciones', verifyToken, asignacionRutaController.getAllAssignments);

// 3.- Obtener una asignacion de zonas a los serenos
router.get('/:asignacionId', verifyToken, asignacionRutaController.getAssignmentById);

// 4.- Actualizar una asignacion de zonas a los serenos
router.put('/:asignacionId', verifyToken, asignacionRutaController.updateAssignment);

// 5.- Eliminar una asignacion de zonas a los serenos
router.delete('/:asignacionId', verifyToken, asignacionRutaController.deleteAssignment);



module.exports = router;
