/// DESCRIPCION: Mis rutas asignadas

const { db } = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");

// ===========================================================
// ============= 1.- Crear una nueva ruta ====================
// ===========================================================
const createRoutePatrol = async (req, res) => {
  try {
    const { name, description, cronograma, assignedSerenazgos  } = req.body;

    // Crear nueva ruta con id único
    const id = uuidv4();
    const newRoute = {
      id,
      name,
      description,
      cronograma,
      assignedSerenazgos: assignedSerenazgos || [], // Lista de serenazgos asignados (pueden ser IDs de usuarios)
      active: true, // Se puede configurar a false si está inactiva
      createdAt: new Date().toISOString(),
    };

    await db.collection("rutas").doc(id).set(newRoute);
    res.status(201).json({ message: "Ruta de patrullaje creada con éxito", route: newRoute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ====================================================================
// ============= 2.- Asignar serenazgos a una ruta ====================
// ====================================================================
const assignSerenazgosToRoute = async (req, res) => {
  try {
    const { routeId, serenazgos, clearExisting  } = req.body; // serenazgos es un array de IDs de usuarios, // `clearExisting` es un flag para saber si eliminar los anteriores

    const routeRef = db.collection("rutas").doc(routeId);
    const routeDoc = await routeRef.get();

    if (!routeDoc.exists) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }

    if (clearExisting) {
      // Si clearExisting es true, eliminar todos los serenazgos actuales y asignar los nuevos
      await routeRef.update({
        assignedSerenazgos: serenazgos,
      });
      return res.status(200).json({ message: "Se ha reemplazado la lista de serenazgos correctamente" });
    }

    // Actualizar la ruta con los serenazgos asignados
    await routeRef.update({
      assignedSerenazgos: serenazgos,
    });

    res.status(200).json({ message: "Serenazgos asignados correctamente" });
  } catch (error) {
    console.error("Error al asignar serenazgos:", error);
    res.status(500).json({ error: "Error al asignar serenazgos a la ruta" });
  }
};

// ==========================================================================
// ============= 3.- Actualizar los detalles de una ruta ====================
// ==========================================================================
const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const updatedData = req.body;

    const routeRef = db.collection("rutas").doc(routeId);
    const routeDoc = await routeRef.get();
    if (!routeDoc.exists) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }

    // Actualizar la ruta con los nuevos datos
    await routeRef.update(updatedData);

    res.status(200).json({ message: "Ruta de patrullaje actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar la ruta:", error);
    res.status(500).json({ error: "Error al actualizar la ruta de patrullaje" });
  }
};

// ==============================================================
// ============= 4.- Obtener todas las rutas ====================
// ==============================================================
const getRoutes = async (req, res) => {
  try {
    const snapshot = await db.collection("rutas").get();
    const routes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(routes);
  } catch (error) {
    console.error("Error al obtener las rutas:", error);
    res.status(500).json({ error: "Error al obtener las rutas" });
  }
};

// =========================================================================
// ============= 5.- Obtener una ruta específica por ID ====================
// =========================================================================
const getRouteById = async (req, res) => {
  try {
    const { routeId } = req.params;
    const routeDoc = await db.collection("rutas").doc(routeId).get();

    if (!routeDoc.exists) {
      return res.status(404).json({ error: "Ruta no encontrada" });
    }

    res.status(200).json({ id: routeDoc.id, ...routeDoc.data() });
  } catch (error) {
    console.error("Error al obtener la ruta:", error);
    res.status(500).json({ error: "Error al obtener la ruta de patrullaje" });
  }
};

module.exports = {
  createRoutePatrol,
  assignSerenazgosToRoute,
  updateRoute,
  getRoutes,
  getRouteById,
};
