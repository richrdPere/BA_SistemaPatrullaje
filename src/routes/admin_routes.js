const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// 1.- Login
router.post("/login_admin", adminController.login_admin);

// 2.- Registro
router.post("/registro_admin", adminController.registro_admin);

// 3.- Obtener todos los admin (ruta más específica primero)
router.get("/admins", verifyToken, adminController.admins);

// 4.- Obtener un admin por ID (ruta dinámica después)
router.get("/:id", verifyToken, adminController.obtener_admins_por_id);

// 5.- Actualizar un admin
router.put("/:id", verifyToken, adminController.actualizar_admin);

// 6.- Eliminar un admin
router.delete("/:id", [verifyToken, isAdmin], adminController.eliminar_admin);


module.exports = router;