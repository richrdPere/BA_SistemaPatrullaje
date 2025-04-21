/// DESCRIPCION: Alertas y notificaciones

const admin = require("firebase-admin");

const notificationController = {
  // Enviar una notificación push a un usuario específico
  async sendNotification(req, res) {
    try {
      const { userId, title, body, data } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({ error: "userId, title y body son obligatorios" });
      }

      // Obtener el token de notificación del usuario desde Firestore
      const userDoc = await admin.firestore().collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const userData = userDoc.data();
      if (!userData.fcmToken) {
        return res.status(400).json({ error: "El usuario no tiene un token FCM registrado" });
      }

      const message = {
        token: userData.fcmToken,
        notification: {
          title,
          body
        },
        data: data || {}
      };

      await admin.messaging().send(message);

      // Guardar la notificación en Firestore
      const notificationRef = await admin.firestore().collection("notifications").add({
        userId,
        title,
        body,
        data: data || {},
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ message: "Notificación enviada correctamente", id: notificationRef.id });
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todas las notificaciones de un usuario
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "El userId es obligatorio" });
      }

      const snapshot = await admin.firestore()
        .collection("notifications")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .get();

      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(notifications);
    } catch (error) {
      console.error("Error al obtener las notificaciones:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar una notificación por ID
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return res.status(400).json({ error: "El ID de la notificación es obligatorio" });
      }

      await admin.firestore().collection("notifications").doc(notificationId).delete();

      res.status(200).json({ message: "Notificación eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = notificationController;
