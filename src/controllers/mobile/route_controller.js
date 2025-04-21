/// DESCRIPCION: Creación y asignación de rutas

const admin = require("firebase-admin");

const routeController = {
  // Crear una nueva ruta de patrullaje
  async createRoute(req, res) {
    try {
      const { name, description, assignedSerenos, checkpoints } = req.body;

      if (!name || !checkpoints || !Array.isArray(checkpoints)) {
        return res.status(400).json({ error: "El nombre y los puntos de control son obligatorios" });
      }

      const newRoute = {
        name,
        description: description || "",
        assignedSerenos: assignedSerenos || [],
        checkpoints,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const routeRef = await admin.firestore().collection("routes").add(newRoute);

      res.status(201).json({ message: "Ruta creada exitosamente", id: routeRef.id });
    } catch (error) {
      console.error("Error al crear la ruta:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todas las rutas de patrullaje
  async getRoutes(req, res) {
    try {
      const snapshot = await admin.firestore().collection("routes").orderBy("createdAt", "desc").get();

      const routes = [];
      snapshot.forEach(doc => {
        routes.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json(routes);
    } catch (error) {
      console.error("Error al obtener las rutas:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener una ruta específica por ID
  async getRouteById(req, res) {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        return res.status(400).json({ error: "El ID de la ruta es obligatorio" });
      }

      const routeDoc = await admin.firestore().collection("routes").doc(routeId).get();

      if (!routeDoc.exists) {
        return res.status(404).json({ error: "Ruta no encontrada" });
      }

      res.status(200).json({ id: routeDoc.id, ...routeDoc.data() });
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar una ruta existente
  async updateRoute(req, res) {
    try {
      const { routeId } = req.params;
      const { name, description, assignedSerenos, checkpoints } = req.body;

      if (!routeId) {
        return res.status(400).json({ error: "El ID de la ruta es obligatorio" });
      }

      const routeRef = admin.firestore().collection("routes").doc(routeId);

      await routeRef.update({
        name,
        description,
        assignedSerenos,
        checkpoints,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ message: "Ruta actualizada exitosamente" });
    } catch (error) {
      console.error("Error al actualizar la ruta:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar una ruta
  async deleteRoute(req, res) {
    try {
      const { routeId } = req.params;

      if (!routeId) {
        return res.status(400).json({ error: "El ID de la ruta es obligatorio" });
      }

      await admin.firestore().collection("routes").doc(routeId).delete();

      res.status(200).json({ message: "Ruta eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la ruta:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = routeController;
