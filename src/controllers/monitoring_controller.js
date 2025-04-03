const admin = require("firebase-admin");

const monitoringController = {
  // Registrar un nuevo monitoreo
  async createMonitoring(req, res) {
    try {
      const { serenoId, location, status, timestamp } = req.body;

      if (!serenoId || !location || !status) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      const newMonitoring = {
        serenoId,
        location,
        status,
        timestamp: timestamp || admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await admin.firestore().collection("monitoring").add(newMonitoring);

      res.status(201).json({ message: "Monitoreo registrado exitosamente", id: docRef.id });
    } catch (error) {
      console.error("Error al registrar monitoreo:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los registros de monitoreo
  async getMonitorings(req, res) {
    try {
      const snapshot = await admin.firestore().collection("monitoring").orderBy("timestamp", "desc").get();

      const monitorings = [];
      snapshot.forEach(doc => {
        monitorings.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(monitorings);
    } catch (error) {
      console.error("Error al obtener registros de monitoreo:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un monitoreo por ID
  async getMonitoringById(req, res) {
    try {
      const { monitoringId } = req.params;

      if (!monitoringId) {
        return res.status(400).json({ error: "El ID del monitoreo es obligatorio" });
      }

      const monitoringDoc = await admin.firestore().collection("monitoring").doc(monitoringId).get();

      if (!monitoringDoc.exists) {
        return res.status(404).json({ error: "Registro de monitoreo no encontrado" });
      }

      res.status(200).json({ id: monitoringDoc.id, ...monitoringDoc.data() });
    } catch (error) {
      console.error("Error al obtener monitoreo:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar un monitoreo
  async deleteMonitoring(req, res) {
    try {
      const { monitoringId } = req.params;

      if (!monitoringId) {
        return res.status(400).json({ error: "El ID del monitoreo es obligatorio" });
      }

      await admin.firestore().collection("monitoring").doc(monitoringId).delete();

      res.status(200).json({ message: "Registro de monitoreo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar monitoreo:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = monitoringController;
