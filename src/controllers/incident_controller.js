const admin = require("firebase-admin");

const incidentController = {
  // Registrar un nuevo incidente
  async registerIncident(req, res) {
    try {
      const { serenoId, type, description, lat, lng, media } = req.body;

      if (!serenoId || !type || !description || !lat || !lng) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      const newIncident = {
        serenoId,
        type,
        description,
        lat,
        lng,
        media: media || [],
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await admin.firestore().collection("incidents").add(newIncident);

      res.status(201).json({ message: "Incidente registrado correctamente", id: docRef.id });
    } catch (error) {
      console.error("Error al registrar el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un incidente por ID
  async getIncident(req, res) {
    try {
      const { incidentId } = req.params;

      if (!incidentId) {
        return res.status(400).json({ error: "El ID del incidente es obligatorio" });
      }

      const doc = await admin.firestore().collection("incidents").doc(incidentId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }

      res.status(200).json(doc.data());
    } catch (error) {
      console.error("Error al obtener el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todos los incidentes registrados
  async getAllIncidents(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").get();
      const incidents = [];

      snapshot.forEach(doc => {
        incidents.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(incidents);
    } catch (error) {
      console.error("Error al obtener los incidentes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar un incidente por ID
  async removeIncident(req, res) {
    try {
      const { incidentId } = req.params;

      if (!incidentId) {
        return res.status(400).json({ error: "El ID del incidente es obligatorio" });
      }

      await admin.firestore().collection("incidents").doc(incidentId).delete();

      res.status(200).json({ message: "Incidente eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = incidentController;
