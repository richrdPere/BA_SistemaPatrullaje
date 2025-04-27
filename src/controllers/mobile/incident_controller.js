/// DESCRIPCION: Registro de incidentes en tiempo real

const admin = require("firebase-admin");

// IMPORTA el socket (lo inyectarás desde tu app principal)
let io;

const incidentController = {
  // Para configurar el socket desde tu app.js/server.js
  setSocketInstance(socketInstance) {
    io = socketInstance;
  },

  // ========================================================
  // 1.- Crear un incidente 
  // ========================================================
  async registerIncident(req, res) {
    try {
      const { serenoId, type, description, lat, lng, media } = req.body;

      if (!serenoId || !type || !description || !lat || !lng) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios" });
      }

      const newIncident = {
        serenoId,
        type,
        description,
        location: {
          lat,
          lng,
        },
        media: media || [],
        status: "pendiente", // Por defecto nuevo incidente empieza pendiente
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      // 1.- Enviar a la app de escritorio en tiempo real
      if (io) {
        io.emit("new-incident", newIncident);
      }
      if (type.toLowerCase() === "emergencia") {
        io.emit("emergency_alert", {
          serenoId,
          description,
          lat,
          lng,
          timestamp: new Date().toISOString()
        });
      }

      // 2.- Registrar en Firestore
      const docRef = await admin
        .firestore()
        .collection("incidents")
        .add(newIncident);

      res
        .status(201)
        .json({ message: "Incidente registrado correctamente", id: docRef.id });
    } catch (error) {
      console.error("Error al registrar el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 2.- Obtener un incidente por ID
  // ==============================================================
  async getIncidentByID(req, res) {
    try {
      const { incidentId } = req.params;

      if (!incidentId) {
        return res
          .status(400)
          .json({ error: "El ID del incidente es obligatorio" });
      }

      const doc = await admin
        .firestore()
        .collection("incidents")
        .doc(incidentId)
        .get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }

      res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error("Error al obtener el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 3.- Obtener todos los incidentes
  // ==============================================================
  async getAllIncidents(req, res) {
    try {
      const snapshot = await admin.firestore().collection("incidents").orderBy("timestamp", "desc").get();
      const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(incidents);

    } catch (error) {
      console.error("Error al obtener los incidentes:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 4.- Eliminar un incidente por ID
  // ==============================================================
  async removeIncident(req, res) {
    try {
      const { incidentId } = req.params;

      if (!incidentId) {
        return res
          .status(400)
          .json({ error: "El ID del incidente es obligatorio" });
      }

      await admin.firestore().collection("incidents").doc(incidentId).delete();

      res.status(200).json({ message: "Incidente eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar el incidente:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 5.- Recuperar incidentes por ID del sereno
  // ==============================================================
  async getIncidentsBySereno(req, res) {
    try {
      const { serenoId } = req.params;
  
      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }
  
      const snapshot = await admin.firestore()
        .collection("incidents")
        .where("serenoId", "==", serenoId)
        .orderBy("timestamp", "desc")
        .get();
  
      const incidents = [];
  
      snapshot.forEach(doc => {
        incidents.push({ id: doc.id, ...doc.data() });
      });
  
      res.status(200).json(incidents);
    } catch (error) {
      console.error("Error al obtener los incidentes del sereno:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = incidentController;
