const { db } = require("../config/firebase");

// Obtener todos los incidentes
const getAllIncidents = async (req, res) => {
  try {
    const snapshot = await db.collection("incidents").get();
    const incidents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo incidentes", error });
  }
};

// Obtener un incidente por ID
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("incidents").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Incidente no encontrado" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo incidente", error });
  }
};

// Crear un nuevo incidente
const createIncident = async (req, res) => {
  try {
    const newIncident = req.body;
    const docRef = await db.collection("incidents").add(newIncident);
    res.status(201).json({ id: docRef.id, ...newIncident });
  } catch (error) {
    res.status(500).json({ message: "Error creando incidente", error });
  }
};

// Actualizar un incidente
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    await db.collection("incidents").doc(id).update(updatedData);
    res.status(200).json({ message: "Incidente actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando incidente", error });
  }
};

// Eliminar un incidente
const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("incidents").doc(id).delete();
    res.status(200).json({ message: "Incidente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error eliminando incidente", error });
  }
};

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
};
