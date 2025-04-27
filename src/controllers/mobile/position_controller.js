const admin = require("firebase-admin");

// CONTROLADOR DE POSICIONES
const positionController = {
  
  // ========================================================
  // 1. Recibir nueva posición
  // ========================================================
  async updatePosition(req, res) {
    try {
      const { serenoId, lat, lng } = req.body;

      if (!serenoId || lat == null || lng == null) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Actualizar la posición actual del sereno
      await admin.firestore().collection("positions").doc(serenoId).set({
        serenoId,
        lat,
        lng,
        timestamp
      });

      // Guardar en historial
      await admin.firestore().collection("positionHistory").add({
        serenoId,
        lat,
        lng,
        timestamp
      });

      // Emitir evento WebSocket
      const io = req.app.get("socketio"); // Tomamos io desde app.js
      io.emit("position_updated", {
        serenoId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      });

      res.status(200).json({ message: "Posición actualizada correctamente" });
    } catch (error) {
      console.error("Error al actualizar posición:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ========================================================
  // 2. Obtener posición actual de un sereno
  // ========================================================
  async getPosition(req, res) {
    try {
      const { serenoId } = req.params;

      const doc = await admin.firestore().collection("positions").doc(serenoId).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Posición no encontrada" });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error al obtener posición:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = positionController;
