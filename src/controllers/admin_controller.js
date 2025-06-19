/// DESCRIPCION: Si también se crean cuentas desde escritorio

const { db } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");

const adminController = {

  // ===========================================================
  // 1.- Login Admin 
  // ===========================================================
  async login_admin(req, res) {

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
        .collection("admins")
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

  // ============================================================================
  // 2.- Crear un usuario (solo operador o supervisor pueden crear serenos)
  // ============================================================================
  async registro_admin(req, res) {
    try {
      const { dni, firstName, lastName, phone = "", birthdate = '', avatar = '', address = '', distrito = '', email, role, username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Verificar si se pasa el rol correcto
      if (role !== "admin") {
        return res.status(400).json({ error: "El rol debe ser 'admin'" });
      }

      // Validación obligatoria
      if (!dni || !firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
      }

      // Verificar si ya existe un usuario con el mismo DNI
      const dniSnapshot = await db
        .collection("admins")
        .where("dni", "==", dni)
        .limit(1)
        .get();

      if (!dniSnapshot.empty) {
        return res.status(400).json({ error: "Ya existe un usuario con ese DNI." });
      }

      // Obtener todos los usuarios para calcular el próximo ID
      const usersSnapshot = await db.collection("admins").get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      usersSnapshot.forEach(doc => {
        const userId = doc.id;
        const match = userId.match(/^ADMIN(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0'); // ejemplo: 00100
      const id = `ADMIN${paddedNumber}`;

      // Si el rol es sereno, la creación de usuarios se limita a admin o supervisor
      // const id = uuidv4();
      const newAdmin = {
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

      await db.collection("admins").doc(id).set(newAdmin);

      res.status(201).json({ message: "Admin creado con éxito", user: newAdmin });
    } catch (error) {
      console.error("Error al crear el Admin:", error);
      res.status(500).json({ error: "Error al crear el Admin" });
    }
  },

  // ===========================================================
  // 3.- Actualizar un usuario 
  // ===========================================================
  async actualizar_admin(req, res) {
    try {
      const userRef = db.collection("admins").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Admin no encontrado" });
      }

      await userRef.update(req.body);

      res.status(200).json({ message: "Admin actualizado con éxito" });
    } catch (error) {
      console.error("Error al actualizar el Admin:", error);
      res.status(500).json({ error: "Error al actualizar el Admin" });
    }
  },

  // ===========================================================
  // 4.- Eliminar un usuario =======================
  // ===========================================================
  async eliminar_admin(req, res) {
    try {
      const userRef = db.collection("admins").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Admin no encontrado" });
      }

      await userRef.delete();

      res.status(200).json({ message: "Admin eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el Admin:", error);
      res.status(500).json({ error: "Error al eliminar el Admin" });
    }
  },

  // ===========================================================
  // 5.- Obtener un usuario por ID 
  // ===========================================================
  async obtener_admins_por_id(req, res) {
    try {
      const doc = await db.collection("admins").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Administrador no encontrado" });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error al obtener el admin:", error);
      res.status(500).json({ error: "Error al obtener el admin" });
    }
  },

  // ===========================================================
  // 6.- Obtener todos los usuarios 
  // ===========================================================
  async admins(req, res) {
    try {
      const snapshot = await db.collection("admins").get();
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener los admins:", error);
      res.status(500).json({ error: "Error al obtener los admins" });
    }
  },

};

module.exports = adminController;
