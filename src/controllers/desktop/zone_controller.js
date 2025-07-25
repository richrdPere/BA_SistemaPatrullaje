const { db } = require("../../config/firebase");
const admin = require("firebase-admin");

const zoneController = {
  // ===========================================================
  // 1.- Crear una zona de patrullaje
  // ===========================================================
  async createZone(req, res) {
    try {
      const { name, description, coordinates, riesgo } = req.body;

      //  Validación básica
      if (!name || !coordinates || !Array.isArray(coordinates)) {
        return res.status(400).json({ message: 'Faltan campos requeridos: name, coordinates' });
      }

      // Validar campo riesgo
      const valoresPermitidos = ['Alto', 'Medio', 'Bajo'];
      if (!valoresPermitidos.includes(riesgo)) {
        return res.status(400).json({ message: "El campo 'riesgo' debe ser: 'Alto', 'Medio' o 'Bajo'." });
      }

      //  Verificar si ya existe una zona con el mismo nombre
      const existing = await db.collection('zonas')
        .where('name', '==', name)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(409).json({ message: 'Ya existe una zona con este nombre.' });
      }

      //  Obtener el último ID generado (ZONA100, ZONA101, ...)
      const zonasSnapshot = await db.collection('zonas').get();

      // Buscar el ID más alto
      let maxNumber = 99;

      zonasSnapshot.forEach(doc => {
        const zonaId = doc.id;
        const match = zonaId.match(/^ZONA(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      // Generar el nuevo ID con ceros a la izquierda (ej. ZONA00100)
      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0');
      const id = `ZONA${paddedNumber}`;

      //  Estructura de zona
      const newZone = {
        id,
        name,
        description: description || '',
        coordinates,
        riesgo,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      //  Guardar en Firebase
      await db.collection('zonas').doc(id).set(newZone);

      res.status(201).json({
        message: 'Zona de patrullaje creada correctamente',
        zone: newZone
      });


    } catch (error) {
      console.error("Error al crear la zona:", error);
      res.status(500).json({ message: 'Error interno al crear la zona', error: error.message });
    }
  },

  // ===========================================================
  // 2.- Obtener todas las zonas
  // ===========================================================
  async getAllZones(req, res) {
    try {
      const snapshot = await db.collection('zonas').orderBy('id', 'asc').get();

      const zonas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json(zonas);
    } catch (error) {
      console.error('Error al obtener las zonas:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 3.- Obtener una zona por ID
  // ===========================================================
  async getZoneById(req, res) {
    try {
      const { zoneId } = req.params;

      const docRef = db.collection('zonas').doc(zoneId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Zona no encontrada' });
      }

      res.status(200).json({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      console.error('Error al obtener la zona:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 4.- Actualizar una zona
  // ===========================================================
  async updateZone(req, res) {
    try {
      const { zoneId } = req.params;
      const { name, description, coordinates } = req.body;

      if (!zoneId) {
        return res.status(400).json({ error: 'ID de zona no proporcionado' });
      }

      const zoneRef = db.collection('zonas').doc(zoneId);
      const doc = await zoneRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Zona no encontrada' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (coordinates) updateData.coordinates = coordinates;
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await zoneRef.update(updateData);

      const updatedDoc = await zoneRef.get();
      res.status(200).json({
        id: updatedDoc.id,
        ...updatedDoc.data()
      });

    } catch (error) {
      console.error('Error al actualizar la zona:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 5.- Eliminar una zona
  // ===========================================================
  async deleteZone(req, res) {
    try {
      const { zoneId } = req.params;

      if (!zoneId) {
        return res.status(400).json({ error: 'ID de zona no proporcionado' });
      }

      const docRef = db.collection('zonas').doc(zoneId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Zona no encontrada' });
      }

      await docRef.delete();
      res.status(200).json({ message: 'Zona de patrullaje eliminada correctamente' });

    } catch (error) {
      console.error('Error al eliminar la zona:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = zoneController;
