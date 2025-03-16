const admin = require("firebase-admin");
const db = admin.firestore();

const PATROLS_COLLECTION = "patrols";

const PatrolModel = {
  async createPatrol(data) {
    const patrolRef = db.collection(PATROLS_COLLECTION).doc();
    data.id = patrolRef.id; // Asignar ID generado por Firestore
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await patrolRef.set(data);
    return data;
  },

  async getPatrolById(id) {
    const patrolDoc = await db.collection(PATROLS_COLLECTION).doc(id).get();
    if (!patrolDoc.exists) {
      throw new Error("Patrulla no encontrada");
    }
    return { id: patrolDoc.id, ...patrolDoc.data() };
  },

  async getAllPatrols() {
    const snapshot = await db.collection(PATROLS_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updatePatrol(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(PATROLS_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deletePatrol(id) {
    await db.collection(PATROLS_COLLECTION).doc(id).delete();
    return { message: "Patrulla eliminada correctamente" };
  }
};

module.exports = PatrolModel;
