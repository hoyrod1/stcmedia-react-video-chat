import { io } from "socket.io-client";

let socket;
const socketConnection = (jwt) => {
  // Check if socket is already connected
  if (socket && socket.connected) {
    // If it is connected, return the connected socket
    return socket;
  } else {
    // Else connect
    const socket = io.connect("https://localhost:9000", {
      auth: {
        jwt,
      },
    });
    return socket;
  }
};

export default socketConnection;
