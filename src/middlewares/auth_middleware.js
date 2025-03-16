const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token no válido." });
  }
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado. No eres administrador." });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
