const express = require("express");
const router = express.Router();
const serenoController = require("../controllers/serenos_controller")
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// 1.- Login
router.post("/login_sereno", serenoController.login_sereno);

// 2.- Registro
router.post("/registro_sereno", serenoController.registro_sereno);

// 3.- Obtener todos los serenos (ruta más específica primero)
router.get("/serenos", verifyToken, serenoController.serenos);

// 4.- Obtener un sereno por ID (ruta dinámica debe ir después)
router.get("/:id", verifyToken, serenoController.obtener_sereno_por_id);

// 5.- Actualizar un sereno
router.put("/:id", verifyToken, serenoController.actualizar_sereno);

// 6.- Eliminar un sereno
router.delete("/:id", [verifyToken, isAdmin], serenoController.eliminar_sereno);

module.exports = router;
