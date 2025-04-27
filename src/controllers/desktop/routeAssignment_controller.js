const admin = require("firebase-admin");

const routeAssignmentController = {
  // ===========================================================
  // 1.- Asignar ruta
  // ===========================================================
  async assignRoute(req, res) {
    try {
      const { serenoId, routeId, type, description, lat, lng, media } = req.body;

      if (!serenoId || !routeId) {
        return res.status(400).json({ error: "Datos incompletos" });
      }

      // (Aquí tu lógica para guardar la asignación, si tienes colección de rutas)

      // Emitir evento WebSocket para el sereno específico
      const io = req.app.get("socketio");
      io.emit(`route_assignment_changed_${serenoId}`, {
        routeId,
        assignedAt: new Date().toISOString(),
      });

      res.status(200).json({ message: "Ruta asignada correctamente" });
    } catch (error) {
      console.error("Error al asignar ruta:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = routeAssignmentController;
