/// DESCRIPCION: Gestión de vehículos

const { db } = require("../../config/firebase");
const admin = require("firebase-admin");

const vehicleController = {
  // ===========================================================
  // 1.- Crear vehiculo
  // ===========================================================
  async createVehicle(req, res) {
    try {
      const { placa, marca, modelo, anio, tipo, estado, uso } = req.body;

      // Validación básica
      if (!placa || !marca || !modelo || !anio || !tipo || !estado || !uso) {
        return res.status(400).json({ message: 'Faltan campos requeridos.' });
      }

      // Validar año
      if (isNaN(anio) || anio < 1900 || anio > new Date().getFullYear() + 1) {
        return res.status(400).json({ message: 'Año inválido.' });
      }

      // Verificar si ya existe un vehículo con la misma placa
      const existing = await db.collection('vehiculos')
        .where('placa', '==', placa)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(409).json({ message: 'Ya existe un vehículo con esta placa.' });
      }

      // Obtener el último ID generado
      const vehiculoSnapshot = await db.collection("vehiculos").get();

      // Buscar el ID más alto
      let maxNumber = 99; // empezamos en 99 para que el primero sea 100
      vehiculoSnapshot.forEach(doc => {
        const vehiculoId = doc.id;
        const match = vehiculoId.match(/^VEHICULO(\d+)$/);
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
      const id = `VEHICULO${paddedNumber}`;

      // Crear objeto vehículo
      const newVehicle = {
        id,
        placa,
        marca,
        modelo,
        anio,
        tipo,
        estado,
        uso,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Guardar en Firebase
      await db.collection('vehiculos').doc(id).set(newVehicle);

      res.status(201).json({
        message: 'Vehículo registrado correctamente',
        vehicle: newVehicle
      });

    } catch (error) {
      console.error("Error al crear vehículo:", error);
      res.status(500).json({ message: 'Error interno al registrar vehículo', error: error.message });
    }
  },

  // ===========================================================
  // 2.- Obtener todas los vehiculos
  // ===========================================================
  async getAllVehicles(req, res) {
    try {
      const snapshot = await db.collection('vehiculos').orderBy('id').get();

      const vehicles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json(vehicles);

    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      res.status(500).json({ message: 'Error interno al obtener vehículos', error: error.message });
    }
  },

  // ===========================================================
  // 3.- Obtener un vehiculo por ID
  // ===========================================================
  async getVehicleById(req, res) {
    try {
      const { vehiculoId } = req.params;
      const doc = await db.collection('vehiculos').doc(vehiculoId).get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Vehículo no encontrado.' });
      }

      res.status(200).json({ vehicle: { id: doc.id, ...doc.data() } });

    } catch (error) {
      console.error("Error al obtener vehículo:", error);
      res.status(500).json({ message: 'Error interno al obtener vehículo', error: error.message });
    }
  },
  // ===========================================================
  // 4.- Actualizar una zona
  // ===========================================================
  async updateVehicle(req, res) {
    try {
      const { vehiculoId } = req.params;
      const updates = req.body;

      const docRef = db.collection('vehiculos').doc(vehiculoId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Vehículo no encontrado.' });
      }

      await docRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const updatedDoc = await docRef.get();

      res.status(200).json({
        message: 'Vehículo actualizado correctamente',
        vehicle: { id: updatedDoc.id, ...updatedDoc.data() }
      });

    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      res.status(500).json({ message: 'Error interno al actualizar vehículo', error: error.message });
    }
  },
  // ===========================================================
  // 5.- Eliminar una zona
  // ===========================================================
  async deleteVehicle(req, res) {
    try {
      const { vehiculoId } = req.params;

      const docRef = db.collection('vehiculos').doc(vehiculoId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: 'Vehículo no encontrado.' });
      }

      await docRef.delete();

      res.status(200).json({ message: 'Vehículo eliminado correctamente' });

    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      res.status(500).json({ message: 'Error interno al eliminar vehículo', error: error.message });
    }
  },
  // ===========================================================
  // 6.- Filtrar por tipo, estado y uso
  // ===========================================================

  async filterVehicles(req, res) {
    try {
      const { tipo, estado, uso } = req.query;

      let query = db.collection('vehiculos');

      if (tipo) query = query.where('tipo', '==', tipo);
      if (estado) query = query.where('estado', '==', estado);
      if (uso) query = query.where('uso', '==', uso);

      const snapshot = await query.get();

      const vehicles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json({ vehicles });

    } catch (error) {
      console.error("Error al filtrar vehículos:", error);
      res.status(500).json({ message: 'Error interno al filtrar vehículos', error: error.message });
    }
  }
};


module.exports = vehicleController;

