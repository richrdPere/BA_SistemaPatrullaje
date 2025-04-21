/// DESCRIPCION: Si también se crean cuentas desde escritorio

const { db } = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");

const userController = {
  // Obtener todos los usuarios
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

  // Obtener un usuario por ID
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

  // Crear un usuario
  async createUser(req, res) {
    try {
      const id = uuidv4();
      const newUser = {
        id,
        ...req.body,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(id).set(newUser);

      res.status(201).json({ message: "Usuario creado con éxito", user: newUser });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  },

  // Actualizar un usuario
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

  // Eliminar un usuario
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
