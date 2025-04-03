const admin = require("firebase-admin");

const trackingController = {
  // Actualizar ubicación en tiempo real
  async updateLocation(req, res) {
    try {
      const { serenoId, lat, lng } = req.body;

      if (!serenoId || !lat || !lng) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }

      await admin.firestore().collection("serenos_tracking").doc(serenoId).set({
        lat,
        lng,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ message: "Ubicación actualizada correctamente" });
    } catch (error) {
      console.error("Error al actualizar la ubicación:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener la ubicación de un sereno específico
  async getLocation(req, res) {
    try {
      const { serenoId } = req.params;

      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      const doc = await admin.firestore().collection("serenos_tracking").doc(serenoId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Ubicación no encontrada" });
      }

      res.status(200).json(doc.data());
    } catch (error) {
      console.error("Error al obtener la ubicación:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todas las ubicaciones activas
  async getAllLocations(req, res) {
    try {
      const snapshot = await admin.firestore().collection("serenos_tracking").get();
      const locations = [];

      snapshot.forEach(doc => {
        locations.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(locations);
    } catch (error) {
      console.error("Error al obtener las ubicaciones:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar la ubicación de un sereno (cuando termina su turno)
  async removeLocation(req, res) {
    try {
      const { serenoId } = req.params;

      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      await admin.firestore().collection("serenos_tracking").doc(serenoId).delete();

      res.status(200).json({ message: "Ubicación eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la ubicación:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = trackingController;
