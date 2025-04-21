/// DESCRIPCION: Gestión de incidentes por supervisores

const admin = require("firebase-admin");

const incidentAdminController = {
  // Obtener todos los incidentes para revisión
  async getAllIncidents(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").orderBy("timestamp", "desc").get();

      const incidents = [];
      snapshot.forEach(doc => {
        incidents.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(incidents);
    } catch (error) {
      console.error("Error al obtener incidentes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Aprobar un incidente
  async approveIncident(req, res) {
    try {
      const { incidentId } = req.params;

      if (!incidentId) {
        return res.status(400).json({ error: "El ID del incidente es obligatorio" });
      }

      await admin.firestore().collection("incidents").doc(incidentId).update({
        status: "aprobado",
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: "Incidente aprobado correctamente" });
    } catch (error) {
      console.error("Error al aprobar incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Rechazar un incidente con motivo
  async rejectIncident(req, res) {
    try {
      const { incidentId } = req.params;
      const { reason } = req.body;

      if (!incidentId) {
        return res.status(400).json({ error: "El ID del incidente es obligatorio" });
      }

      if (!reason) {
        return res.status(400).json({ error: "Debe proporcionar un motivo de rechazo" });
      }

      await admin.firestore().collection("incidents").doc(incidentId).update({
        status: "rechazado",
        rejectionReason: reason,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ message: "Incidente rechazado correctamente" });
    } catch (error) {
      console.error("Error al rechazar incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener un resumen de incidentes por estado
  async getIncidentSummary(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").get();

      let summary = { total: 0, aprobados: 0, rechazados: 0, pendientes: 0 };

      snapshot.forEach(doc => {
        const data = doc.data();
        summary.total++;
        if (data.status === "aprobado") summary.aprobados++;
        else if (data.status === "rechazado") summary.rechazados++;
        else summary.pendientes++;
      });

      res.status(200).json(summary);
    } catch (error) {
      console.error("Error al obtener resumen de incidentes:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = incidentAdminController;
