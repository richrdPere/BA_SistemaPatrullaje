/// DESCRIPCION: Operaciones en conjunto con otras entidades

const { db } = require("../../config/firebase");
const admin = require("firebase-admin");

const OperacionesConjuntoController = {
  // ===========================================================
  // 1.- Crear operación
  // ===========================================================
  async createJointOperation(req, res) {
    try {
      const { actividad, descripcion, fecha, hora, lugar, nombreEntidad } = req.body;

      // Validación básica
      if (!actividad || !descripcion || !fecha || !hora || !nombreEntidad) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
      }

      // Obtener el último ID generado
      const operacionesSnapshot = await db.collection('operaciones_conjuntas').get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      operacionesSnapshot.forEach(doc => {
        const operacionId = doc.id;
        const match = operacionId.match(/^OPERACION(\d+)$/);
        if (match) {
          const number = parseInt(match[1], 10);
          if (number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      // Generar ID con ceros (ej. VEHICULO00100)
      const nextIdNumber = maxNumber + 1;
      const paddedNumber = String(nextIdNumber).padStart(5, '0');
      const id = `OPERACION${paddedNumber}`;

      // Estructura del documento
      const newOperation = {
        id,
        actividad,
        descripcion,
        fecha,
        hora,
        lugar,
        nombreEntidad,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Guardar en Firebase
      await db.collection('operaciones_conjuntas').doc(id).set(newOperation);

      res.status(201).json({
        message: 'Operación conjunta registrada correctamente',
        operacion: newOperation
      });

    } catch (error) {
      console.error("Error al registrar operación conjunta:", error);
      res.status(500).json({ message: 'Error interno al registrar operación conjunta', error: error.message });
    }
  },

  // ===========================================================
  // 2.- Obtener todas las operaciones
  // ===========================================================
  async getAllJointOperations(req, res) {
    try {
      const snapshot = await db.collection('operaciones_conjuntas')
        .orderBy('id', 'asc')
        .get();

      const operaciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json(operaciones);

    } catch (error) {
      console.error("Error al obtener operaciones:", error);
      res.status(500).json({ message: 'Error interno al obtener operaciones conjuntas', error: error.message });
    }
  },

  // ===========================================================
  // 3.- Obtener operacion por ID
  // ===========================================================
  async getJointOperationById(req, res) {
    try {
      const { operacionesId } = req.params;
      const doc = await db.collection('operaciones_conjuntas').doc(operacionesId).get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Operación no encontrada.' });
      }

      res.status(200).json({ operacion: { id: doc.id, ...doc.data() } });

    } catch (error) {
      console.error("Error al obtener operación:", error);
      res.status(500).json({ message: 'Error interno al obtener operación', error: error.message });
    }
  },

  // ===========================================================
  // 4.- Obtener operacion por ID
  // ===========================================================
  async filterJointOperations(req, res) {
    try {
      const { fecha, nombreEntidad } = req.query;

      let query = db.collection('operaciones_conjuntas');

      if (fecha) {
        query = query.where('fecha', '==', fecha);
      }

      if (nombreEntidad) {
        query = query.where('nombreEntidad', '==', nombreEntidad);
      }

      const snapshot = await query.get();

      const operaciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json( operaciones );

    } catch (error) {
      console.error("Error al filtrar operaciones:", error);
      res.status(500).json({ message: 'Error interno al filtrar operaciones conjuntas', error: error.message });
    }
  },

  // ===========================================================
  // 5.- Obtener operacion por ID
  // ===========================================================
  async updateJointOperation(req, res) {
    try {
      const { operacionesId } = req.params;
      const updates = req.body;

      const docRef = db.collection('operaciones_conjuntas').doc(operacionesId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Operación no encontrada.' });
      }

      await docRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updatedDoc = await docRef.get();

      res.status(200).json({
        message: 'Operación actualizada correctamente',
        operacion: { id: updatedDoc.id, ...updatedDoc.data() }
      });

    } catch (error) {
      console.error("Error al actualizar operación:", error);
      res.status(500).json({ message: 'Error interno al actualizar operación', error: error.message });
    }
  },

  // ===========================================================
  // 5.- Eliminar una zona
  // ===========================================================
  async deleteJointOperation(req, res) {
    try {
      const { operacionesId } = req.params;

      const docRef = db.collection('operaciones_conjuntas').doc(operacionesId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Operación no encontrada.' });
      }

      await docRef.delete();

      res.status(200).json({ message: 'Operación eliminada correctamente' });

    } catch (error) {
      console.error("Error al eliminar operación:", error);
      res.status(500).json({ message: 'Error interno al eliminar operación', error: error.message });
    }
  }






};

module.exports = OperacionesConjuntoController;
