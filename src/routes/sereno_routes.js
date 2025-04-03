const express = require("express");
const router = express.Router();
const serenoController = require("../controllers/sereno_controller");

// Rutas para la gestión de serenos
router.post("/createSereno", serenoController.createSereno);
router.get("/", serenoController.getSerenos);
router.get("/:serenoId", serenoController.getSerenoById);
router.put("/:serenoId", serenoController.updateSereno);
router.delete("/:serenoId", serenoController.deleteSereno);

module.exports = router;
