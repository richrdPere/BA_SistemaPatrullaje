const admin = require("firebase-admin");
const db = admin.firestore();

const VEHICLES_COLLECTION = "vehicles";

const VehicleModel = {
  async createVehicle(data) {
    const vehicleRef = db.collection(VEHICLES_COLLECTION).doc();
    data.id = vehicleRef.id;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await vehicleRef.set(data);
    return data;
  },

  async getVehicleById(id) {
    const vehicleDoc = await db.collection(VEHICLES_COLLECTION).doc(id).get();
    if (!vehicleDoc.exists) {
      throw new Error("Vehículo no encontrado");
    }
    return { id: vehicleDoc.id, ...vehicleDoc.data() };
  },

  async getAllVehicles() {
    const snapshot = await db.collection(VEHICLES_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateVehicle(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(VEHICLES_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deleteVehicle(id) {
    await db.collection(VEHICLES_COLLECTION).doc(id).delete();
    return { message: "Vehículo eliminado correctamente" };
  }
};

module.exports = VehicleModel;
