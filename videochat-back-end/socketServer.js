//==========================================//
const io = require("./server").io;
//==========================================//
//==========================================//
const app = require("./server").app;
//==========================================//

//==========================================//
// require (JWT) Json Web Token
const jwt = require("jsonwebtoken");
const secretLink = "ihadhdfH283JWT";
//==========================================//

// const professionalAppointments = app.get("professionalAppointments");

//==========================================//
const connectedProfessionals = [];
//==========================================//

//==========================================//
const allKnownOffers = {
  //uniqueId - Unique-Key
  //offer
  //professionalsFullName
  //clientName
  //appDate
  //offererIceCandidates
  //answer
  //answerIceCandidate
};
//==========================================//

//============================================================================//
io.on("connection", (socket) => {
  // console.log(socket.id, "has connected");
  //========================================================//
  const handshakeData = socket.handshake.auth.jwt;
  //========================================================//
  //========================================================//
  let decodedData;
  try {
    // Decode the jwt with our secret (secretLink)
    decodedData = jwt.verify(handshakeData, secretLink);
    // console.log(decodedData);
  } catch (error) {
    console.log(error);
    // If there is a error kill the connection
    socket.disconnect;
    return;
  }
  //========================================================//

  //========================================================//
  const { fullName, proId } = decodedData;
  //========================================================//

  //========================================================//
  if (proId) {
    // Before pushing to the "connectedProfessionals[]" array
    // Check if the user is already in the "connectedProfessionals[]" array
    // This will happen because a user has connected
    const connectedPro = connectedProfessionals.find((cp) => cp.proId === proId);
    if (connectedPro) {
      // If they are already in the "connectedProfessionals[]" array
      // Then just update the new "socket.id"
      // console.log(connectedPro);
      connectedPro.proId = socket.id;
    } else {
      // Else push them to the "connectedProfessionals[]" array
      connectedProfessionals.push({
        socketId: socket.id,
        fullName: fullName,
        proId,
      });
    }
    // Send the apptData to the professional
    // console.log(connectedProfessionals);
    const professionalAppointments = app.get("professionalAppointments");
    // console.log(decodedData);
    // console.log("=======================");
    // console.log(professionalAppointments[0].professionalsFullName);
    // console.log(fullName);
    socket.emit(
      "apptData",
      professionalAppointments.filter((pa) => pa.professionalsFullName === fullName)
    );
    // Loop though all known professionals and send to all professionals that joined
    for (const key in allKnownOffers) {
      if (allKnownOffers[key].professionalsFullName === fullName) {
        // This offer is for this pro
        io.to(socket.id).emit("newOfferWaiting", allKnownOffers[key]);
      }
    }
  } else {
    // This is a client
  }
  //========================================================//

  //========================================================//
  socket.on("newOffer", ({ offer, apptInfo }) => {
    // offer = sdp/type, apptInfo has the uuid
    // that can added to the allKnownOffers object
    // so the professional can find exactly the right allKnownOffers
    allKnownOffers[apptInfo.uuid] = {
      ...apptInfo,
      offer,
      offererIceCandidates: [],
      answer: null,
      answerIceCandidate: [],
    };
    //  We don't want to emit this "offer object" to everyone
    // This "offer object" is for a specific professional
    // We got professionalAppointments from express (That is where it's made)
    const professionalAppointments = app.get("professionalAppointments");
    // Find this paticular appointment so we can update that the user is waiting
    // An offer has been sent
    const pa = professionalAppointments.find(
      (pa) => pa.professionalsFullName === apptInfo.fullName
    );
    console.log(professionalAppointments);
    console.log(apptInfo);
    if (pa) {
      pa.waiting = true;
    }
    // Find thid particular proffessional so we can emit
    const p = connectedProfessionals.find((cp) => {
      cp.fullName === apptInfo.professionalsFullName;
    });
    if (p) {
      // Only emit if the professional is connected
      const socketId = p.socketId;
      // Send the new offer over
      socket.to(socketId).emit("newOfferWaiting", allKnownOffers[apptInfo.uuid]);
      // Send the updated appt info with the new waiting
      socket.to(socketId).emit(
        "apptData",
        professionalAppointments.filter(
          (pa) => pa.professionalsFullName === apptInfo.professionalsFullName
        )
      );
    }
  });
  //========================================================//
});
//============================================================================//
