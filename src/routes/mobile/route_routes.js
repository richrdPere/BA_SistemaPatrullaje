const express = require("express");
const router = express.Router();
const routeController = require("../../controllers/mobile/route_controller");

// Rutas para la gestión de rutas de patrullaje
router.post("/register", routeController.createRoute);
router.get("/", routeController.getRoutes);
router.get("/:routeId", routeController.getRouteById);
router.put("/:routeId", routeController.updateRoute);
router.delete("/:routeId", routeController.deleteRoute);

module.exports = router;
