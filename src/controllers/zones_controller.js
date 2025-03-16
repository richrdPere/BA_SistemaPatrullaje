const { db } = require("../config/firebase");

const ZONES_COLLECTION = "zones";

// Obtener todas las zonas de patrullaje
const getAllZones = async (req, res) => {
  try {
    const snapshot = await db.collection(ZONES_COLLECTION).get();
    const zones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(zones);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo zonas", error });
  }
};

// Obtener una zona por ID
const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(ZONES_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Zona no encontrada" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo la zona", error });
  }
};

// Crear una nueva zona
const createZone = async (req, res) => {
  try {
    const newZone = req.body;
    const docRef = await db.collection(ZONES_COLLECTION).add(newZone);
    res.status(201).json({ id: docRef.id, ...newZone });
  } catch (error) {
    res.status(500).json({ message: "Error creando la zona", error });
  }
};

// Actualizar una zona por ID
const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedZone = req.body;
    await db.collection(ZONES_COLLECTION).doc(id).update(updatedZone);
    res.status(200).json({ id, ...updatedZone });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando la zona", error });
  }
};

// Eliminar una zona por ID
const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(ZONES_COLLECTION).doc(id).delete();
    res.status(200).json({ message: "Zona eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando la zona", error });
  }
};

module.exports = {
  getAllZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
};
