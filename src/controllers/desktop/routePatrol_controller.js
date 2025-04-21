/// DESCRIPCION: Mis rutas asignadas

const { db } = require("../../config/firebase");

const createRoutePatrol = async (req, res) => {
  try {
    const { name, description, path, patrolId } = req.body;
    const newRouteRef = db.collection("routes_patrol").doc();
    const newRoute = {
      id: newRouteRef.id,
      name,
      description,
      path,
      patrolId,
      createdAt: new Date().toISOString(),
    };
    await newRouteRef.set(newRoute);
    res.status(201).json({ message: "Route patrol created successfully", route: newRoute });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoutesPatrol = async (req, res) => {
  try {
    const snapshot = await db.collection("routes_patrol").get();
    const routes = snapshot.docs.map(doc => doc.data());
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoutePatrolById = async (req, res) => {
  try {
    const { id } = req.params;
    const routeRef = db.collection("routes_patrol").doc(id);
    const route = await routeRef.get();
    if (!route.exists) {
      return res.status(404).json({ message: "Route patrol not found" });
    }
    res.status(200).json(route.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRoutePatrol = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const routeRef = db.collection("routes_patrol").doc(id);
    await routeRef.update(updatedData);
    res.status(200).json({ message: "Route patrol updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoutePatrol = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("routes_patrol").doc(id).delete();
    res.status(200).json({ message: "Route patrol deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRoutePatrol,
  getRoutesPatrol,
  getRoutePatrolById,
  updateRoutePatrol,
  deleteRoutePatrol,
};
