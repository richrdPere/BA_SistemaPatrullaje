const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();
const { db } = require("./src/config/firebase"); // Importar Firebase

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

// Configure Static files
app.use(express.static("src/uploads"));

// Middlewares
app.use(cors());
app.use(express.json());

// WebSockets
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Importar rutas
const authRoutes = require("./src/routes/auth_routes");
app.use("/api", authRoutes);

// Función para probar conexión con Firebase
async function testFirebase() {
  try {
    const testRef = db.collection("test").doc("connection");
    await testRef.set({ message: "Firebase conectado correctamente", timestamp: new Date() });

    console.log("✅ Firebase está funcionando correctamente");
  } catch (error) {
    console.error("❌ Error al conectar con Firebase:", error);
  }
}

// Ejecutar test de Firebase
testFirebase();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log("  ");
  console.log(`La URL es: http://${process.env.IP_SERVER}:${PORT}/api`)
});
