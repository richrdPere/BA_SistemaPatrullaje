/// DESCRIPCION: Inicio de sesión del sereno

const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const authController = {
  // ======================================================
  // ============= Registrar un usuario ===================
  // ======================================================
  async registerUser(req, res) {

    try {
      const { dni, firstName, lastName, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1.- Validar datos
      if (!email) res.status(400).send({ msg: "El Email es obligatorio!" });
      if (!password)
        res.status(400).send({ msg: "La Contraseña es obligatorio!" });
      if (!email || !password || !role) {
        return res.status(400).send({ msg: "Email, Contraseña y Rol son obligatorios!" });
      }
      if (role !== "sereno" && role !== "supervisor" && role !== "admin") {
        return res.status(400).send({ msg: "El rol debe ser uno de: sereno, supervisor, admin." });
      }

      // 2.- Crear documento User para DB en Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      // 3.- Guardar usuario en Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        dni,
        firstName,
        lastName,
        email,
        role,
        active: false,
        uid: userRecord.uid,
        password: hashedPassword,
      });

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        uid: userRecord.uid,
      });
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ======================================================
  // ================== Iniciar sesión ====================
  // ======================================================
  async loginUser(req, res) {

    try {
      const { email, password } = req.body;

      // 1.- Validar email y password
      if (!email)
        return res.status(400).send({ msg: "El email es obligatorio!" });
      if (!password)
        return res.status(400).send({ msg: "El password es obligatorio!" });
      if (!email || !password) {
        return res.status(400).send({ msg: "El email y el password son obligatorios!" });
      }

      // 2.- Encontrar usuario
      const userSnapshot = await admin
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .get();

      // 3.- Validar al usuario encontrado
      if (userSnapshot.empty) {
        return res.status(400).json({ error: "El usuario no existe!" });
      }

      // 4.- Validar email y password
      const userData = userSnapshot.docs[0].data();

      // 5.- Comparar contraseñas
      const isMatch = await bcrypt.compare(password, userData.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Credenciales inválidas" });
      }

      // 6.- Crear token JWT
      const token = jwt.sign(
        { uid: userData.uid, role: userData.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        token,
        user: { uid: userData.uid, email: userData.email, role: userData.role },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ======================================================
  // ============== Verificar token JWT ===================
  // ======================================================
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ valid: true, decoded });
    } catch (error) {
      res.status(401).json({ valid: false, error: "Invalid token" });
    }
  },

  // =========================================================
  // ============== Middleware para verificar si =============
  // ============ el usuario tiene el rol adecuado ===========
  // =========================================================
  checkRole(allowedRoles) {
    return async (req, res, next) => {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!allowedRoles.includes(decoded.role)) {
          return res.status(403).json({ error: "No tienes permiso para acceder a esta ruta" });
        }

        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: "Token inválido" });
      }
    };
  },
};

module.exports = authController;
