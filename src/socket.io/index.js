import { Server } from "socket.io";
import { replyMessage, startChat } from "./chat/chat.service.js";
import { socketAuth } from "./middleware/auth.middleware.socket.js";

let io;
export const runSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket.on("startChat", startChat(socket, io));

    socket.on("replyMessage", replyMessage(socket, io));
  });

  return io;
};


export default io;