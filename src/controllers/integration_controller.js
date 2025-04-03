const admin = require("firebase-admin");
const axios = require("axios"); // Para realizar solicitudes a APIs externas

const integrationController = {
  // Integración con el sistema de la PNP
  async getPNPIncidents(req, res) {
    try {
      const response = await axios.get("https://api.pnp.gob.pe/incidents");
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error al obtener datos de la PNP:", error);
      res.status(500).json({ error: "No se pudo obtener datos de la PNP" });
    }
  },

  // Integración con el sistema de cámaras de seguridad
  async getCCTVFeed(req, res) {
    try {
      const response = await axios.get("https://api.cctv.gob.pe/feeds");
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error al obtener feeds de CCTV:", error);
      res.status(500).json({ error: "No se pudo obtener el feed de CCTV" });
    }
  },

  // Enviar alertas a una plataforma externa (Ejemplo: un sistema de emergencias)
  async sendEmergencyAlert(req, res) {
    try {
      const { incidentId, severity } = req.body;

      if (!incidentId || !severity) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      const response = await axios.post("https://api.alertas.gob.pe/emergency", {
        incidentId,
        severity,
      });

      res.status(200).json({ message: "Alerta enviada correctamente", data: response.data });
    } catch (error) {
      console.error("Error al enviar alerta de emergencia:", error);
      res.status(500).json({ error: "No se pudo enviar la alerta" });
    }
  }
};

module.exports = integrationController;
