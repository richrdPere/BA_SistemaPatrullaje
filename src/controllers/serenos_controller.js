/// DESCRIPCION: Inicio de sesión del sereno

const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { db } = require("../config/firebase");
require("dotenv").config();

const serenoController = {
  // ===========================================================
  // 1.- Login Sereno 
  // ===========================================================
  async login_sereno(req, res) {

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
        .collection("serenos")
        .where("username", "==", username)
        .get();

      // 3.- Validar al usuario encontrado
      if (userSnapshot.empty) {
        return res.status(400).json({ error: "El sereno no existe!" });
      }

      // 4.- Validar email y password
      // const userData = userSnapshot.docs[0].data();
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

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

      //  Excluimos el password del objeto de respuesta
      const { password: _, ...safeUserData } = userData;

      //  Incluimos el ID como campo aparte si no está en los datos
      safeUserData.id = userDoc.id;

      res.json({
        token,
        user: safeUserData,
      });


    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ============================================================================
  // 2.- Crear un Sereno (solo operador o supervisor pueden crear serenos)
  // ============================================================================
  async registro_sereno(req, res) {
    try {
      const { dni, firstName, lastName, phone = "", birthdate = '', avatar = '', address = '', distrito = '', email, role, username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Verificar si se pasa el rol correcto
      if (role !== "sereno") {
        return res.status(400).json({ error: "El rol debe ser 'sereno'" });
      }

      // Validación obligatoria
      if (!dni || !firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }

      // Verificar si ya existe un usuario con el mismo DNI
      const dniSnapshot = await db
        .collection("serenos")
        .where("dni", "==", dni)
        .limit(1)
        .get();

      if (!dniSnapshot.empty) {
        return res.status(400).json({ error: "Ya existe un usuario con ese DNI." });
      }

      // Obtener todos los usuarios para calcular el próximo ID
      const usersSnapshot = await db.collection("serenos").get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      usersSnapshot.forEach(doc => {
        const userId = doc.id;
        const match = userId.match(/^SERENO(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0'); // ejemplo: 00100
      const id = `SERENO${paddedNumber}`;

      // Si el rol es sereno, la creación de usuarios se limita a admin o supervisor
      // const id = uuidv4();
      const newSereno = {
        id,
        dni,
        avatar,
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

      await db.collection("serenos").doc(id).set(newSereno);

      res.status(201).json({ message: "Sereno creado con éxito", user: newSereno });
    } catch (error) {
      console.error("Error al crear al Sereno:", error);
      res.status(500).json({ error: "Error al crear al Sereno" });
    }
  },

  // ===========================================================
  // 3.- Actualizar un Sereno 
  // ===========================================================
  async actualizar_sereno(req, res) {
    try {
      const userRef = db.collection("serenos").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Sereno no encontrado" });
      }

      await userRef.update(req.body);

      res.status(200).json({ message: "Sereno actualizado con éxito" });
    } catch (error) {
      console.error("Error al actualizar al Sereno:", error);
      res.status(500).json({ error: "Error al actualizar al Sereno" });
    }
  },

  // ===========================================================
  // 4.- Eliminar un Sereno 
  // ===========================================================
  async eliminar_sereno(req, res) {
    try {
      const userRef = db.collection("serenos").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Sereno no encontrado" });
      }

      await userRef.delete();

      res.status(200).json({ message: "Sereno eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el Sereno:", error);
      res.status(500).json({ error: "Error al eliminar el Sereno" });
    }
  },

  // ===========================================================
  // 5.- Obtener un sereno por ID 
  // ===========================================================
  async obtener_sereno_por_id(req, res) {
    try {
      const doc = await db.collection("serenos").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Sereno no encontrado" });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error al obtener al sereno:", error);
      res.status(500).json({ error: "Error al obtener al sereno" });
    }
  },

  // ===========================================================
  // 6.- Obtener todos los serenos 
  // ===========================================================
  async serenos(req, res) {
    try {
      const snapshot = await db.collection("serenos").get();
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener los serenos:", error);
      res.status(500).json({ error: "Error al obtener los serenos" });
    }
  },
};

module.exports = serenoController;
