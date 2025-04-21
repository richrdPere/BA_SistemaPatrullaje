const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/mobile/notification_controller");
const { verifyToken, isAdmin } = require("../../middlewares/auth_middleware");

// Rutas para notificaciones
router.post("/send", verifyToken, notificationController.sendNotification);
router.get("/:userId", verifyToken, notificationController.getUserNotifications);
router.delete("/:notificationId", verifyToken, notificationController.deleteNotification);

module.exports = router;
