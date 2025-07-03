/// DESCRIPCION: Creación y asignación de rutas

const admin = require("firebase-admin");
const { db } = require("../../config/firebase");

const asignacionRutaController = {
  // ===========================================================
  // 1.- Crear una nueva asignacion de patrullaje a los serenos
  // ===========================================================
  async assignRoute(req, res) {
    try {
      //const db = getFirestore();
      const { zonaId, serenos, turno, fecha } = req.body;

      //  Validaciones básicas
      if (!zonaId || !serenos || !turno || !fecha) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      if (!Array.isArray(serenos) || serenos.length === 0) {
        return res.status(400).json({ message: "Debes asignar al menos un sereno" });
      }

      //  Generar ID personalizado: ASIG100, ASIG101, etc.
      const snapshot = await db.collection("asignaciones").get();
      const newId = `ASIG00${(100 + snapshot.size + 1).toString().padStart(3, '0')}`;

      const asignacion = {
        id: newId,
        zonaId,
        serenos,
        turno,
        fecha,
        estado: "activo",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      //  Guardar la asignación
      await db.collection("asignaciones").doc(newId).set(asignacion);

      //  Opcional: actualizar estado de cada sereno a "asignado"
      const batch = db.batch();
      for (const serenoId of serenos) {
        const serenoRef = db.collection("serenos").doc(serenoId);
        batch.update(serenoRef, { estado: "Asignado" });
        // batch.update(serenoRef, { estado: false });
      }
      await batch.commit();

      res.status(201).json({
        message: "Ruta asignada exitosamente",
        asignacion,
      });

    } catch (error) {
      console.error(" Error al asignar la ruta:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 2.- Obtener todas las asignaciones de patrullaje
  // ===========================================================
  async getAllAssignments(req, res) {
    try {
      //const db = getFirestore();
      const snapshot = await db.collection('asignaciones').get();

      const asignaciones = snapshot.docs.map(doc => doc.data());
      res.status(200).json(asignaciones);
    } catch (error) {
      console.error(" Error al obtener asignaciones:", error);
      res.status(500).json({ error: error.message });
    }
  },


  // ===========================================================
  // 3.- Obtener una asignacion específica por ID
  // ===========================================================
  async getAssignmentById(req, res) {
    try {
      //const db = getFirestore();
      const { asignacionId } = req.params;

      if (!asignacionId) {
        return res.status(400).json({ message: "ID de asignación requerido" });
      }

      const doc = await db.collection('asignaciones').doc(asignacionId).get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Asignación no encontrada" });
      }

      res.status(200).json(doc.data());
    } catch (error) {
      console.error(" Error al obtener la asignación:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 4.- Actualizar una asignacion existente
  // ===========================================================
  async updateAssignment(req, res) {
    try {
      //const db = getFirestore();
      const { asignacionId } = req.params;
      const { zonaId, serenos, turno, fecha, estado } = req.body;

      const docRef = db.collection('asignaciones').doc(asignacionId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Asignación no encontrada" });
      }

      const updates = {
        ...(zonaId && { zonaId }),
        ...(serenos && { serenos }),
        ...(turno && { turno }),
        ...(fecha && { fecha }),
        ...(estado && { estado }),
      };

      await docRef.update(updates);

      res.status(200).json({ message: "Asignación actualizada", updates });
    } catch (error) {
      console.error(" Error al actualizar la asignación:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ===========================================================
  // 5.- Eliminar una ruta
  // ===========================================================
  async deleteAssignment(req, res) {
    try {
      //const db = getFirestore();
      const { asignacionId } = req.params;

      const docRef = db.collection('asignaciones').doc(asignacionId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Asignación no encontrada" });
      }

      await docRef.delete();
      res.status(200).json({ message: "Asignación eliminada correctamente" });
    } catch (error) {
      console.error(" Error al eliminar la asignación:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = asignacionRutaController;
