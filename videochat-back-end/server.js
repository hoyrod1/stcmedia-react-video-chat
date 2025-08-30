// This is where we create our express and socket.io server
const fs = require("fs");
//========================================================================//
const https = require("https");
//========================================================================//
const express = require("express");
//========================================================================//
const cors = require("cors"); //
//========================================================================//
const socketio = require("socket.io");
//========================================================================//
const app = express();
//========================================================================//
// This will open our express API to any domain //
app.use(cors());
app.use(express.static(__dirname + "/public"));
// This will allow the app to parse json in the body with the body parser //
app.use(express.json());
//========================================================================//
// MADE KEY AND CERT TO RUN HTTPS //
const key = fs.readFileSync("./certs/cert.key");
const cert = fs.readFileSync("./certs/cert.crt");
//========================================================================//
// WHEN USING HTTPS //
const expressServer = https.createServer({ key, cert }, app);
//========================================================================//
const io = socketio(expressServer, {
  cors: ["https://localhost:3000", "https://localhost:3001", "https://localhost:3002"],
});
// const io = socketio(expressServer);
//========================================================================//
// app.get("/test", (req, res) => {
//   res.json("This is a test router");
// });

//==========================================================================//
// APPLICATION LISTENING ON PORT 9000//
expressServer.listen(9000);
//==========================================================================//

//==========================================================================//
module.exports = { io, expressServer, app };
//==========================================================================//
