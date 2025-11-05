const { io } = require("socket.io-client");

// Remplace par l'URL de ton backend
const socket = io("http://localhost:5000");

// Remplace par un vrai userId MongoDB existant dans ta base
const userId = "ID_UTILISATEUR_MONGODB";

socket.on("connect", () => {
  console.log("Connecté au serveur Socket.IO");
  socket.emit("join", userId);
});

socket.on("notification", (notif) => {
  console.log("Notification reçue :", notif);
});