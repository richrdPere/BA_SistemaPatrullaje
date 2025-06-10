/// DESCRIPCION: Inicio de sesión del sereno

const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");
require("dotenv").config();

const authController = {
  // ======================================================
  // ============= Registrar un usuario ===================
  // ======================================================
  async registerUser(req, res) {

    try {
      const { dni, firstName, lastName, phone = "", birthdate = "", address = "", distrito = "", email, username, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1.- Validar datos
      if (!email) res.status(400).send({ msg: "El Email es obligatorio!" });
      if (!username) res.status(400).send({ msg: "El Username es obligatorio!" });
      if (!password)
        res.status(400).send({ msg: "La Contraseña es obligatorio!" });
      if (!email || !password || !role) {
        return res.status(400).send({ msg: "Email, Contraseña y Rol son obligatorios!" });
      }
      if (role !== "sereno" && role !== "operador" && role !== "admin") {
        return res.status(400).send({ msg: "El rol debe ser uno de: sereno, operador, admin." });
      }

      // 2.- Crear documento User para DB en Firebase Authentication
      const userRecord = await admin.auth().createUser({
        username,
        password,
      });

      // 3.- Obtener todos los usuarios para calcular el próximo ID
      const usersSnapshot = await db.collection("users").get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      usersSnapshot.forEach(doc => {
        const userId = doc.id;
        const match = userId.match(/^USER(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0'); // ejemplo: 00100
      const id = `USER${paddedNumber}`;

      // 3.- Guardar usuario en Firestore
      // await admin.firestore().collection("users").doc(userRecord.uid).set({
      //   dni,
      //   firstName,
      //   lastName,
      //   email,
      //   username,
      //   role,
      //   active: false,
      //   uid: userRecord.uid,
      //   password: hashedPassword,
      // });

      const newUser = {
        id,
        dni,
        avatar: '',
        firstName,
        lastName,
        phone,
        birthdate,
        address,
        distrito,
        email,
        username,
        role,
        active: true,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(id).set(newUser);


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
      const { username, password } = req.body;

      // 1.- Validar email y password
      if (!username)
        return res.status(400).send({ msg: "El username es obligatorio!" });
      if (!password)
        return res.status(400).send({ msg: "El password es obligatorio!" });
      if (!username || !password) {
        return res.status(400).send({ msg: "El username y el password son obligatorios!" });
      }

      // 2.- Encontrar usuario
      const userSnapshot = await admin
        .firestore()
        .collection("users")
        .where("username", "==", username)
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
