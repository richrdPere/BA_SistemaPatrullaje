const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");

const serenoController = {
  // Registrar un nuevo sereno
  async createSereno(req, res) {
    try {
      const { dni, firstName, lastName, email, password, phone, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      if (!dni || !firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      const newSereno = {
        dni,
        firstName,
        lastName,
        email,
        phone: phone || "",
        role: role || "sereno",
        active: true,
        uid: userRecord.uid,
        password: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await admin.firestore().collection("serenos").doc(userRecord.uid).set(newSereno);

      res.status(201).json({ message: "Sereno registrado exitosamente", uid: userRecord.uid });
    } catch (error) {
      console.error("Error al registrar el sereno:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los serenos
  async getSerenos(req, res) {
    try {
      const snapshot = await admin.firestore().collection("serenos").orderBy("createdAt", "desc").get();

      const serenos = [];
      snapshot.forEach(doc => {
        serenos.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(serenos);
    } catch (error) {
      console.error("Error al obtener serenos:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un sereno por su ID
  async getSerenoById(req, res) {
    try {
      const { serenoId } = req.params;

      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      const serenoDoc = await admin.firestore().collection("serenos").doc(serenoId).get();

      if (!serenoDoc.exists) {
        return res.status(404).json({ error: "Sereno no encontrado" });
      }

      res.status(200).json({ id: serenoDoc.id, ...serenoDoc.data() });
    } catch (error) {
      console.error("Error al obtener sereno:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar información de un sereno
  async updateSereno(req, res) {
    try {
      const { serenoId } = req.params;
      const { firstName, lastName, phone, role, active } = req.body;

      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      const serenoRef = admin.firestore().collection("serenos").doc(serenoId);

      await serenoRef.update({
        firstName,
        lastName,
        phone,
        role,
        active,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: "Sereno actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar sereno:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar un sereno
  async deleteSereno(req, res) {
    try {
      const { serenoId } = req.params;

      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      await admin.firestore().collection("serenos").doc(serenoId).delete();
      await admin.auth().deleteUser(serenoId);

      res.status(200).json({ message: "Sereno eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar sereno:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = serenoController;
