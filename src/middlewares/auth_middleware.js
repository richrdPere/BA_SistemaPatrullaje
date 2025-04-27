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

// =========================================================
  // ============== Middleware para verificar si =============
  // ============ el usuario tiene el rol adecuado ===========
  // =========================================================
  // checkRole(allowedRoles) {
  //   return async (req, res, next) => {
  //     try {
  //       const token = req.headers.authorization.split(" ")[1];
  //       const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //       if (!allowedRoles.includes(decoded.role)) {
  //         return res.status(403).json({ error: "No tienes permiso para acceder a esta ruta" });
  //       }

  //       req.user = decoded;
  //       next();
  //     } catch (error) {
  //       res.status(401).json({ error: "Token inválido" });
  //     }
  //   };
  // };

module.exports = { verifyToken, isAdmin };
