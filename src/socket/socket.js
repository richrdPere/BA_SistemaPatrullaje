let io = null;

function setupWebSocket(server) {
  const socketio = require("socket.io");
  io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });

  return io;
}

module.exports = setupWebSocket;
