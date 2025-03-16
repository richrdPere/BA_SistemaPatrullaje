const admin = require("firebase-admin");
const db = admin.firestore();

const ROUTES_COLLECTION = "routes_patrol";

const RoutesPatrolModel = {
  async createRoute(data) {
    const routeRef = db.collection(ROUTES_COLLECTION).doc();
    data.id = routeRef.id; // Asignar ID generado por Firestore
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await routeRef.set(data);
    return data;
  },

  async getRouteById(id) {
    const routeDoc = await db.collection(ROUTES_COLLECTION).doc(id).get();
    if (!routeDoc.exists) {
      throw new Error("Ruta de patrullaje no encontrada");
    }
    return { id: routeDoc.id, ...routeDoc.data() };
  },

  async getAllRoutes() {
    const snapshot = await db.collection(ROUTES_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateRoute(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(ROUTES_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deleteRoute(id) {
    await db.collection(ROUTES_COLLECTION).doc(id).delete();
    return { message: "Ruta de patrullaje eliminada correctamente" };
  }
};

module.exports = RoutesPatrolModel;
