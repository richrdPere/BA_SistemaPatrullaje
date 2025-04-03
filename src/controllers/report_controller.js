const admin = require("firebase-admin");
const json2csv = require("json2csv").parse; // Para exportar reportes en CSV

const reportController = {
  // Obtener todos los reportes de incidentes
  async getIncidentReports(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").orderBy("timestamp", "desc").get();

      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener reportes de incidentes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener reportes de rutas de patrullaje
  async getRouteReports(req, res) {
    try {
      const snapshot = await admin.firestore().collection("routes").orderBy("createdAt", "desc").get();

      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener reportes de rutas:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener reportes de actividad de serenos
  async getSerenoReports(req, res) {
    try {
      const snapshot = await admin.firestore().collection("serenos").orderBy("lastActivity", "desc").get();

      const reports = [];
      snapshot.forEach(doc => {
        reports.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(reports);
    } catch (error) {
      console.error("Error al obtener reportes de serenos:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Exportar reportes de incidentes en CSV
  async exportIncidentReportsCSV(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").get();
      const reports = snapshot.docs.map(doc => doc.data());

      if (reports.length === 0) {
        return res.status(404).json({ error: "No hay datos disponibles para exportar." });
      }

      const csv = json2csv(reports, { fields: ["id", "type", "location", "status", "timestamp"] });

      res.header("Content-Type", "text/csv");
      res.attachment("incident_reports.csv");
      return res.send(csv);
    } catch (error) {
      console.error("Error al exportar reportes de incidentes en CSV:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reportController;
