const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");
const { verifyToken, isAdmin } = require("../middlewares/auth_middleware");

// Ruta para registrar un nuevo usuario
router.post("/register", verifyToken, userController.createUser);

// Ruta para obtener todos los usuarios
router.get("/user_all", verifyToken, userController.getUsers);

// Ruta para obtener un usuario por ID
router.get("/:id", verifyToken, userController.getUserById);

// Ruta para actualizar un usuario
router.put("/:id", verifyToken, userController.updateUser);

// Ruta para eliminar un usuario
router.delete("/:id", [verifyToken, isAdmin], userController.deleteUser);

module.exports = router;