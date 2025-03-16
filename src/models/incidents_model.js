const admin = require("firebase-admin");
const db = admin.firestore();

const INCIDENTS_COLLECTION = "incidents";

const IncidentModel = {
  async createIncident(data) {
    const incidentRef = db.collection(INCIDENTS_COLLECTION).doc();
    data.id = incidentRef.id; // Asignar ID generado por Firestore
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await incidentRef.set(data);
    return data;
  },

  async getIncidentById(id) {
    const incidentDoc = await db.collection(INCIDENTS_COLLECTION).doc(id).get();
    if (!incidentDoc.exists) {
      throw new Error("Incidente no encontrado");
    }
    return { id: incidentDoc.id, ...incidentDoc.data() };
  },

  async getAllIncidents() {
    const snapshot = await db.collection(INCIDENTS_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateIncident(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(INCIDENTS_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deleteIncident(id) {
    await db.collection(INCIDENTS_COLLECTION).doc(id).delete();
    return { message: "Incidente eliminado correctamente" };
  }
};

module.exports = IncidentModel;
