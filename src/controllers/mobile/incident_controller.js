/// DESCRIPCION: Registro de incidentes en tiempo real
const admin = require("firebase-admin");
const { db } = require("../../config/firebase");

// IMPORTA el socket (lo inyectarás desde tu app principal)
let io;

const incidentController = {
  // Para configurar el socket desde tu app.js/server.js
  setSocketInstance(socketInstance) {
    io = socketInstance;
  },

  // ========================================================
  // 1.- Crear un incidente - MOVIL
  // ========================================================
  async registerIncident(req, res) {
    try {
      const {
        descripcion,
        tipo,
        ubicacion,
        fecha,
        estado,
        prioridad,
        serenoId,
        media
      } = req.body;

      // Validaciones básicas
      if (!descripcion || !tipo || !ubicacion || !ubicacion.lat || !ubicacion.lon || !ubicacion.direccion || !fecha || !estado || !prioridad || !serenoId) {
        return res.status(400).json({
          error: "Todos los campos obligatorios deben estar completos"
        });
      }

      // Obtener todos los INCIDENTES para calcular el próximo ID
      const usersSnapshot = await db.collection("incidents").get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      usersSnapshot.forEach(doc => {
        const incidentId = doc.id;
        const match = incidentId.match(/^INCIDENTE(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0'); // ejemplo: 00100
      const id = `INCIDENTE${paddedNumber}`;

      const newIncident = {
        id: id,
        serenoId,
        tipo,
        descripcion,
        ubicacion: {
          lat: ubicacion.lat,
          lon: ubicacion.lon,
          direccion: ubicacion.direccion,
        },
        fecha: new Date(fecha), // puedes guardar como tipo fecha
        estado: estado.toLowerCase(), // pendiente, atendido, cerrado, falso
        prioridad: prioridad.toLowerCase(), // alta, media, baja
        media: {
          imagenURL: media?.imagenURL || null,
          videoURL: media?.videoURL || null,
          audioURL: media?.audioURL || null
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      // Enviar a la app escritorio en tiempo real
      if (io) {
        io.emit("new-incident", newIncident);
      }

      // Si es emergencia, emitir alerta especial
      if (tipo.toLowerCase() === "emergencia") {
        io.emit("emergency_alert", {
          serenoId,
          descripcion,
          lat: ubicacion.lat,
          lon: ubicacion.lon,
          timestamp: new Date().toISOString()
        });
      }

      // Guardar en Firestore
      const docRef = await admin.firestore().collection("incidents").add(newIncident);

      return res.status(201).json({
        message: "Incidente registrado correctamente",
        id: docRef.id
      });

    } catch (error) {
      console.error("Error al registrar el incidente:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 2.- Obtener un incidente por ID
  // ==============================================================
  async getIncidentByID(req, res) {
    try {
      const { incidentId } = req.params;

      // Validar que el ID esté presente
      if (!incidentId) {
        return res
          .status(400)
          .json({ error: "El ID del incidente es obligatorio" });
      }

      // Obtener el documento desde Firestore
      const doc = await admin
        .firestore()
        .collection("incidents")
        .doc(incidentId)
        .get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }

      const data = doc.data();

      // Responder con estructura completa del incidente
      const incidente = {
        id: doc.id,
        descripcion: data.descripcion,
        tipo: data.tipo,
        ubicacion: {
          lat: data.ubicacion?.lat || null,
          lon: data.ubicacion?.lon || null,
          direccion: data.ubicacion?.direccion || null
        },
        fecha: data.fecha instanceof admin.firestore.Timestamp
          ? data.fecha.toDate()
          : data.fecha,
        estado: data.estado,
        prioridad: data.prioridad,
        serenoId: data.serenoId,
        media: {
          imagenURL: data.media?.imagenURL || null,
          videoURL: data.media?.videoURL || null,
          audioURL: data.media?.audioURL || null
        },
        timestamp: data.timestamp || null
      };

      return res.status(200).json(incidente);
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
      // 1. Obtener la colección de incidentes ordenados por timestamp descendente
      const snapshot = await admin
        .firestore()
        .collection("incidents")
        .orderBy("timestamp", "desc")
        .get();

      // 2. Transformar cada documento en un objeto estructurado
      const incidents = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id, // ID del documento Firestore
          descripcion: data.descripcion, // Descripción textual del incidente
          tipo: data.tipo, // Tipo del incidente: robo, emergencia, etc.
          ubicacion: {
            lat: data.ubicacion?.lat || null,         // Latitud del incidente
            lon: data.ubicacion?.lon || null,         // Longitud del incidente
            direccion: data.ubicacion?.direccion || null // Dirección textual
          },
          fecha: data.fecha instanceof admin.firestore.Timestamp
            ? data.fecha.toDate() // Convertir Timestamp de Firestore a objeto Date
            : data.fecha,         // O dejarla como viene si ya es string
          estado: data.estado,       // Estado actual: pendiente, atendido, cerrado, falso
          prioridad: data.prioridad, // Prioridad del incidente: alta, media, baja
          serenoId: data.serenoId,   // ID del sereno que lo registró
          media: {
            imagenURL: data.media?.imagenURL || null, // URL de imagen asociada
            videoURL: data.media?.videoURL || null,   // URL de video asociado
            audioURL: data.media?.audioURL || null    // URL de audio asociado
          },
          timestamp: data.timestamp || null // Marca de tiempo generada automáticamente
        };
      });

      // 3. Responder al cliente con la lista de incidentes estructurada
      return res.status(200).json(incidents);

    } catch (error) {
      // 4. Manejo de errores
      console.error("Error al obtener los incidentes:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 4.- Eliminar un incidente por ID
  // ==============================================================
  async removeIncident(req, res) {
    try {
      // 1. Obtener el ID del incidente desde los parámetros de la ruta
      const { incidentId } = req.params;

      // 2. Validar que el ID haya sido proporcionado
      if (!incidentId) {
        return res
          .status(400)
          .json({ error: "El ID del incidente es obligatorio" });
      }

      // 3. Referencia al documento de incidente en Firestore
      const docRef = admin.firestore().collection("incidents").doc(incidentId);
      const doc = await docRef.get();

      // 4. Verificar si el documento existe antes de intentar eliminarlo
      if (!doc.exists) {
        return res
          .status(404)
          .json({ error: "Incidente no encontrado. No se puede eliminar." });
      }

      // 5. Eliminar el documento del incidente
      await docRef.delete();

      // 6. Respuesta exitosa
      return res.status(200).json({ message: "Incidente eliminado correctamente" });

    } catch (error) {
      // 7. Captura y respuesta ante cualquier error inesperado
      console.error("Error al eliminar el incidente:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 5.- Recuperar incidentes por ID del sereno
  // ==============================================================
  async getIncidentsBySereno(req, res) {
    try {
      // 1. Obtener el ID del sereno desde los parámetros de la URL
      const { serenoId } = req.params;

      // 2. Validar que el ID esté presente
      if (!serenoId) {
        return res.status(400).json({ error: "El ID del sereno es obligatorio" });
      }

      // 3. Consultar Firestore para obtener todos los incidentes de ese sereno
      const snapshot = await admin.firestore()
        .collection("incidents")
        .where("serenoId", "==", serenoId)
        .orderBy("timestamp", "desc")
        .get();

      // 4. Transformar cada documento en un objeto estructurado
      const incidents = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          descripcion: data.descripcion,
          tipo: data.tipo,
          ubicacion: {
            lat: data.ubicacion?.lat || null,
            lon: data.ubicacion?.lon || null,
            direccion: data.ubicacion?.direccion || null
          },
          fecha: data.fecha instanceof admin.firestore.Timestamp
            ? data.fecha.toDate()
            : data.fecha,
          estado: data.estado,
          prioridad: data.prioridad,
          serenoId: data.serenoId,
          media: {
            imagenURL: data.media?.imagenURL || null,
            videoURL: data.media?.videoURL || null,
            audioURL: data.media?.audioURL || null
          },
          timestamp: data.timestamp || null
        };
      });

      // 5. Responder con la lista de incidentes del sereno
      return res.status(200).json(incidents);

    } catch (error) {
      // 6. Manejo de errores inesperados
      console.error("Error al obtener los incidentes del sereno:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 6.- Actualizar estado, tipo o prioridad de un incidente
  // ==============================================================

  async updateIncidentFields(req, res) {
    try {
      // 1. Obtener el ID del incidente desde los parámetros de la URL
      const { incidentId } = req.params;

      // 2. Validar que exista el ID
      if (!incidentId) {
        return res.status(400).json({ error: "El ID del incidente es obligatorio" });
      }

      // 3. Obtener los campos opcionales desde el body
      const { estado, tipo, prioridad } = req.body;

      // 4. Validar que al menos uno esté presente
      if (!estado && !tipo && !prioridad) {
        return res.status(400).json({ error: "Debe enviar al menos un campo a actualizar (estado, tipo o prioridad)" });
      }

      // 5. Crear un objeto de actualización dinámico
      const updateData = {};
      if (estado) updateData.estado = estado.toLowerCase();
      if (tipo) updateData.tipo = tipo.toLowerCase();
      if (prioridad) updateData.prioridad = prioridad.toLowerCase();

      // 6. Referencia al documento
      const docRef = admin.firestore().collection("incidents").doc(incidentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Incidente no encontrado" });
      }

      // 7. Realizar la actualización
      await docRef.update(updateData);

      // 8. Enviar respuesta de éxito
      return res.status(200).json({
        message: "Incidente actualizado correctamente",
        updated: updateData,
        id: incidentId
      });

    } catch (error) {
      console.error("Error al actualizar el incidente:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // ==============================================================
  // 7.- Filtro múltiple de incidentes (estado, tipo, prioridad, serenoId, rango de fechas)
  // ==============================================================

  async filterIncidents(req, res) {
    try {
      const { estado, tipo, prioridad, serenoId, desde, hasta } = req.query;

      // Validación: al menos un filtro
      if (!estado && !tipo && !prioridad && !serenoId && !desde && !hasta) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un filtro (estado, tipo, prioridad, serenoId o rango de fechas)"
        });
      }

      let query = admin.firestore().collection("incidents");

      // Filtros simples
      if (estado) query = query.where("estado", "==", estado.toLowerCase());
      if (tipo) query = query.where("tipo", "==", tipo.toLowerCase());
      if (prioridad) query = query.where("prioridad", "==", prioridad.toLowerCase());
      if (serenoId) query = query.where("serenoId", "==", serenoId);

      // Filtro por rango de fechas
      if (desde || hasta) {
        let fechaDesde = desde ? new Date(desde) : null;
        let fechaHasta = hasta ? new Date(hasta) : null;

        if (fechaDesde && fechaHasta) {
          query = query.where("fecha", ">=", fechaDesde).where("fecha", "<=", fechaHasta);
        } else if (fechaDesde) {
          query = query.where("fecha", ">=", fechaDesde);
        } else if (fechaHasta) {
          query = query.where("fecha", "<=", fechaHasta);
        }
      }

      query = query.orderBy("timestamp", "desc");

      const snapshot = await query.get();

      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          descripcion: data.descripcion,
          tipo: data.tipo,
          ubicacion: {
            lat: data.ubicacion?.lat || null,
            lon: data.ubicacion?.lon || null,
            direccion: data.ubicacion?.direccion || null
          },
          fecha: data.fecha instanceof admin.firestore.Timestamp
            ? data.fecha.toDate()
            : data.fecha,
          estado: data.estado,
          prioridad: data.prioridad,
          serenoId: data.serenoId,
          media: {
            imagenURL: data.media?.imagenURL || null,
            videoURL: data.media?.videoURL || null,
            audioURL: data.media?.audioURL || null
          },
          timestamp: data.timestamp || null
        };
      });

      return res.status(200).json(results);

    } catch (error) {
      console.error("Error al filtrar incidentes:", error);
      return res.status(500).json({ error: error.message });
    }
  }



};

module.exports = incidentController;
