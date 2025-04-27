const express = require("express");
const authController = require("../controllers/auth_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Route
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/register", authController.registerUser);

// Ruta para iniciar sesión
router.post("/login", authController.loginUser);

// // Ruta para obtener información del usuario autenticado
// router.get("/me", verifyToken, authController.getProfile);

// // Ruta para cerrar sesión
// router.post("/logout", verifyToken, authController.logout);

// // Ruta para obtener todos los usuarios (solo admin)
// router.get("/users", [verifyToken, isAdmin], authController.getAllUsers);

module.exports = router;
