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
const connectedClients = [];
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
  //answerIceCandidates
};
//==========================================//

//=====================================================================================//
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
    socket.disconnect();
    return;
  }
  //========================================================//
  // console.log("============ Top decodedData 1 ===========");
  // console.log(decodedData);
  // console.log("============ Bottom decodedData 1 ===========");
  //========================================================//
  const { fullName, proId } = decodedData;
  // console.log("============ Top fullName 1 ===========");
  // console.log(fullName);
  // console.log("============ Bottom fullName 1 ===========");
  //========================================================//

  //========================================================//
  if (proId) {
    // console.log("============ Top fullName when 'proId' exist ===========");
    // console.log(fullName);
    // console.log("============ Bottom fullName when 'proId' exist ===========");
    // Before pushing to the "connectedProfessionals[]" array
    // Check if the user is already in the "connectedProfessionals[]" array
    // This will happen because a user has connected
    const connectedPro = connectedProfessionals.find((cp) => cp.proId === proId);
    if (connectedPro) {
      // If they are already in the "connectedProfessionals[]" array
      // Then just update the new "socket.id"
      // console.log(connectedPro);
      connectedPro.socketId = socket.id;
    } else {
      // Else push them to the "connectedProfessionals[]" array
      connectedProfessionals.push({
        socketId: socket.id,
        fullName,
        proId,
      });
    }
    // Send the apptData to the professional
    // console.log(connectedProfessionals);
    const professionalAppointments = app.get("professionalAppointments");
    // console.log("============ Top decodedData when 'proId' exist ===========");
    // console.log(decodedData);
    // console.log("============ Bottom decodedData when 'proId' exist ===========");
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
    const { professionalsFullName, uuid, clientName } = decodedData;
    // Check to see if the client is already in the array
    // Because the client may have reconnected
    const clientExist = connectedClients.find((c) => c.uuid == uuid);
    if (clientExist) {
      // If client exist just update the client ID
      clientExist.socketId = socket.id;
    } else {
      // Else add/push the client to the new array
      connectedClients.push({
        professionalMeetingWith: professionalsFullName,
        uuid,
        clientName,
        socketId: socket.id,
      });
    }

    const offerForTheClient = allKnownOffers[uuid];
    if (offerForTheClient) {
      io.to(socket.id).emit("änswerToClient", offerForTheClient.answer);
    }
  }
  //========================================================//
  console.log(connectedProfessionals);
  //=====================================================================================//

  //=====================================================================================//
  socket.on("newAnswer", ({ answer, uuid }) => {
    // Emit this to the client
    const socketToSendTo = connectedClients.find((c) => c.uuid == uuid);
    if (socketToSendTo) {
      socket.to(socketToSendTo.socketId).emit("änswerToClient", answer);
    }
    // Update the offer
    const knownOffer = allKnownOffers[uuid];
    if (knownOffer) {
      knownOffer.answer = answer;
    }
  });
  //=====================================================================================//

  //=====================================================================================//
  socket.on("newOffer", ({ offer, apptInfo }) => {
    // console.log("=============== offer Top ===============");
    // console.log(offer);
    // console.log("=============== offer Bottom ===============");
    // offer = sdp/type, apptInfo has the uuid
    // that can added to the allKnownOffers object
    // so the professional can find exactly the right allKnownOffers
    // console.log("=============== apptInfo Top ===============");
    // console.log(apptInfo);
    // console.log("=============== apptInfo Bottom ===============");
    allKnownOffers[apptInfo.uuid] = {
      ...apptInfo,
      offer,
      offererIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
    };
    //  We don't want to emit this "offer object" to everyone
    // This "offer object" is for a specific professional
    // We got professionalAppointments from express (That is where it's made)
    const professionalAppointments = app.get("professionalAppointments");
    // Find this paticular appointment so we can update that the user is waiting
    // An offer has been sent
    const pa = professionalAppointments.find((pa) => pa.uuid === apptInfo.uuid);
    // console.log(professionalAppointments);
    // console.log(apptInfo);
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
  //=====================================================================================//

  //=====================================================================================//
  socket.on("getIce", (uuid, who, ackFunc) => {
    const offer = allKnownOffers[uuid];
    let icaCandidates = [];
    if (who === "professional") {
      icaCandidates = offer.offererIceCandidates;
    } else if (who === "client") {
      icaCandidates = offer.offererIceCandidates;
    }
    ackFunc(icaCandidates);
  });
  //=====================================================================================//

  //=====================================================================================//
  socket.on("iceToServer", ({ who, iceC, uuid }) => {
    // console.log("=============== who ===============");
    // console.log(who);
    // console.log("=============== iceC ===============");
    // console.log(iceC);
    // console.log("=============== uuid ===============");
    // console.log(uuid);
    console.log("==============================", who);
    const offerToUpdate = allKnownOffers[uuid];
    if (offerToUpdate) {
      if (who === "client") {
        // This means that a "client" has sent up theor iceCandidates
        offerToUpdate.offererIceCandidates.push(iceC);
        const socketToSendTo = connectedProfessionals.find(
          (cp) => cp.fullName === decodedData.professionalsFullName
        );
        if (socketToSendTo) {
          socket.to(socketToSendTo.socketId).emit("iceToClient", iceC);
        }
      } else if (who === "professional") {
        // This means that a "professional" has sent up theor iceCandidates
        offerToUpdate.offererIceCandidates.push(iceC);
        const socketToSendTo = connectedClients.find((cc) => cc.uuid == uuid);
        if (socketToSendTo) {
          socket.to(socketToSendTo.socketId).emit("iceToClient", iceC);
        }
      }
    }
  });
  //=====================================================================================//
});
