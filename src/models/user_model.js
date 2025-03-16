const admin = require("firebase-admin");
const db = admin.firestore();

const USERS_COLLECTION = "users";

const UserModel = {
  async createUser(data) {
    const userRef = db.collection(USERS_COLLECTION).doc();
    data.id = userRef.id;
    data.createdAt = admin.firestore.FieldValue.serverTimestamp();
    await userRef.set(data);
    return data;
  },

  async getUserById(id) {
    const userDoc = await db.collection(USERS_COLLECTION).doc(id).get();
    if (!userDoc.exists) {
      throw new Error("Usuario no encontrado");
    }
    return { id: userDoc.id, ...userDoc.data() };
  },

  async getAllUsers() {
    const snapshot = await db.collection(USERS_COLLECTION).orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async updateUser(id, data) {
    data.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await db.collection(USERS_COLLECTION).doc(id).update(data);
    return { id, ...data };
  },

  async deleteUser(id) {
    await db.collection(USERS_COLLECTION).doc(id).delete();
    return { message: "Usuario eliminado correctamente" };
  }
};

module.exports = UserModel;
