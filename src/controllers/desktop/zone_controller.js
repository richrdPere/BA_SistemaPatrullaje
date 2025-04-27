const Zone = require("../models/zone");

const zoneController = {
  // Crear una zona de patrullaje
  async createZone(req, res) {
    try {
      const { name, description, coordinates } = req.body;
      const newZone = new Zone({ name, description, coordinates });
      await newZone.save();
      res.status(201).json({ message: "Zona de patrullaje creada", zone: newZone });
    } catch (error) {
      console.error("Error al crear la zona:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener todas las zonas
  async getAllZones(req, res) {
    try {
      const zones = await Zone.find();
      res.status(200).json(zones);
    } catch (error) {
      console.error("Error al obtener las zonas:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener una zona por ID
  async getZoneById(req, res) {
    try {
      const { zoneId } = req.params;
      const zone = await Zone.findById(zoneId);

      if (!zone) {
        return res.status(404).json({ error: "Zona no encontrada" });
      }

      res.status(200).json(zone);
    } catch (error) {
      console.error("Error al obtener la zona:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar una zona
  async updateZone(req, res) {
    try {
      const { zoneId } = req.params;
      const { name, description, coordinates } = req.body;

      const updatedZone = await Zone.findByIdAndUpdate(zoneId, { name, description, coordinates }, { new: true });

      if (!updatedZone) {
        return res.status(404).json({ error: "Zona no encontrada" });
      }

      res.status(200).json(updatedZone);
    } catch (error) {
      console.error("Error al actualizar la zona:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar una zona
  async deleteZone(req, res) {
    try {
      const { zoneId } = req.params;
      await Zone.findByIdAndDelete(zoneId);
      res.status(200).json({ message: "Zona de patrullaje eliminada correctamente" });
    } catch (error) {
      console.error("Error al eliminar la zona:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = zoneController;
