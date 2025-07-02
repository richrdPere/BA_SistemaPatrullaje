const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();
const { db } = require("./src/config/firebase"); // Importar Firebase

const setupWebSocket = require("./src/socket/socket");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: { origin: "*" },
//   methods: ["GET", "POST"]
// });
const io = setupWebSocket(server);

// Middleware para que los controladores accedan al io
app.use((req, res, next) => {
  req.app.set("socketio", io);
  next();
});

// const incidentController = require('./src/controllers/mobile/incident_controller');

// Importar rutas - GENERALES
const serenoRoutes = require("./src/routes/serenos_routes");
const adminRoutes = require("./src/routes/admin_routes");

// Importar rutas - DESKTOP
const ZonaRoutes = require("./src/routes/desktop/zone_routes");

const Route_Patrol_Routes =require("./src/routes/desktop/routePatrol_routes");
const Route_assignment_Routes = require("./src/routes/desktop/routeAssignment_routes");
const routeRoutes = require("./src/routes/desktop/route_routes");

const incidentAdminRoutes = require("./src/routes/desktop/incidentAdmin_routes");
const integrationRoutes = require("./src/routes/desktop/integration_routes");
const monitoringRoutes = require("./src/routes/desktop/monitoring_routes");
const reportRoutes = require("./src/routes/desktop/report_routes");

// Importar rutas - MOBILE
const incidentRoutes = require("./src/routes/mobile/incident_routes");
const positionRoutes = require("./src/routes/mobile/position_route");
const notificationRoutes = require("./src/routes/mobile/notification_routes");
const trackingRoutes = require("./src/routes/mobile/tracking_routes");

// Configurar el socket en el controller
// incidentController.setSocketInstance(io);

// Configure Static files
app.use(express.static("src/uploads"));

// Middlewares
app.use(cors());
app.use(express.json());

// WebSockets
io.on("connection", (socket) => {
  console.log("Cliente de escritorio conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente de escritorio desconectado:", socket.id);
  });
});

// ROUTES
app.use("/api/sereno", serenoRoutes);
app.use("/api/admin", adminRoutes);

// Routes movil
app.use("/api/routes", routeRoutes);
app.use("/api/positions", positionRoutes);

app.use("/api/tracking", trackingRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/notifications", notificationRoutes);


// Routes desk
app.use("/api/zonas", ZonaRoutes);



app.use("/api/routes_patrol", Route_Patrol_Routes);
app.use("/api/routes_assignments", Route_assignment_Routes);

app.use("/api/serenos", serenoRoutes);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/admin/incidents", incidentAdminRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/integrations", integrationRoutes);


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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log("  ");
  console.log(`La URL es: http://${process.env.IP_SERVER}:${PORT}/api`)
});
