const admin = require("firebase-admin");
const db = admin.firestore();

const ZONES_COLLECTION = "zones";

const ZoneModel = {
  async createZone(data) {
    const zoneRef = db.collection(ZONES_COLLECTION).doc();
    data.id = zoneRef.id;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await zoneRef.set(data);
    return data;
  },

  async getZoneById(id) {
    const zoneDoc = await db.collection(ZONES_COLLECTION).doc(id).get();
    if (!zoneDoc.exists) {
      throw new Error("Zona no encontrada");
    }
    return { id: zoneDoc.id, ...zoneDoc.data() };
  },

  async getAllZones() {
    const snapshot = await db.collection(ZONES_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateZone(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(ZONES_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deleteZone(id) {
    await db.collection(ZONES_COLLECTION).doc(id).delete();
    return { message: "Zona eliminada correctamente" };
  }
};

module.exports = ZoneModel;
