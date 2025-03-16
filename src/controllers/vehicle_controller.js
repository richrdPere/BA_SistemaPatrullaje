const { db } = require("../config/firebase");

const addVehicle = async (req, res) => {
  try {
    const { type, plateNumber, status } = req.body;
    const newVehicle = { type, plateNumber, status, createdAt: new Date() };
    const docRef = await db.collection("vehicles").add(newVehicle);
    res.status(201).json({ id: docRef.id, ...newVehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const snapshot = await db.collection("vehicles").get();
    const vehicles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("vehicles").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("vehicles").doc(id).update(req.body);
    res.status(200).json({ message: "Vehicle updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("vehicles").doc(id).delete();
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle };
