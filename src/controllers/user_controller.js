/// DESCRIPCION: Si también se crean cuentas desde escritorio

const { db } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Middleware para verificar el token JWT y el rol
const verifyTokenAndRole = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; // Se obtiene el token del header
  if (!token) {
    return res.status(403).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodificar el token
    req.user = decoded; // Añadir la información del usuario decodificado a la request

    // Verificar si el usuario tiene el rol adecuado (por ejemplo, admin o supervisor)
    if (decoded.role !== "admin" && decoded.role !== "supervisor") {
      return res.status(403).json({ error: "No tienes permisos para crear un sereno" });
    }

    next(); // El token es válido y el rol es adecuado, se continúa con la ejecución
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};


const userController = {
  // ===========================================================
  // 1.- Obtener todos los usuarios 
  // ===========================================================
  async getUsers(req, res) {
    try {
      const snapshot = await db.collection("users").get();
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      res.status(500).json({ error: "Error al obtener los usuarios" });
    }
  },

  // ===========================================================
  // 2.- Obtener un usuario por ID 
  // ===========================================================
  async getUserById(req, res) {
    try {
      const doc = await db.collection("users").doc(req.params.id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      res.status(500).json({ error: "Error al obtener el usuario" });
    }
  },

  // ============================================================================
  // 3.- Crear un usuario (solo operador o supervisor pueden crear serenos)
  // ============================================================================
  async createUser(req, res) {
    try {
      const { dni, firstName, lastName, phone, birthdate, avatar='', address='', distrito='', email, role, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Verificar si se pasa el rol correcto
      if (role !== "sereno") {
        return res.status(400).json({ error: "El rol debe ser 'sereno'" });
      }
      // if (role !== "operador") {
      //   return res.status(400).json({ error: "El rol debe ser 'operador'" });
      // }

      // Obtener todos los usuarios para calcular el próximo ID
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

      // Si el rol es sereno, la creación de usuarios se limita a admin o supervisor
      // const id = uuidv4();
      const newUser = {
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
        active: false,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(id).set(newUser);

      res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  },

  // ===========================================================
  // 4.- Actualizar un usuario 
  // ===========================================================
  async updateUser(req, res) {
    try {
      const userRef = db.collection("users").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      await userRef.update(req.body);

      res.status(200).json({ message: "Usuario actualizado con éxito" });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  },

  // ===========================================================
  // =============== Eliminar un usuario =======================
  // ===========================================================
  async deleteUser(req, res) {
    try {
      const userRef = db.collection("users").doc(req.params.id);
      const doc = await userRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      await userRef.delete();

      res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).json({ error: "Error al eliminar el usuario" });
    }
  },
};

module.exports = userController;
