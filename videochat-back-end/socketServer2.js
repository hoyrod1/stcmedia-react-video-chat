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
  //answerIceCandidates
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
  // console.log("============ Top decodedData 1 ===========");
  // console.log(decodedData);
  // console.log("============ Bottom decodedData 1 ===========");
  //========================================================//
  //== "fullName" was changed to "professionalsFullName" ==//
  //============ "proId" was changed to "uuid" ============//
  // const { fullName, proId } = decodedData; //
  //========================================================//
  const { professionalsFullName, uuid } = decodedData;
  // console.log("============ Top fullName 1 ===========");
  // console.log(professionalsFullName);
  // console.log("============ Bottom fullName 1 ===========");
  // console.log("============ Top proId 1 ===========");
  // console.log(uuid);
  // console.log("============ Bottom proId 1 ===========");
  //========================================================//

  //========================================================//
  if (uuid) {
    // Before pushing to the "connectedProfessionals[]" array
    // Check if the user is already in the "connectedProfessionals[]" array
    // This will happen because a user has connected
    const connectedPro = connectedProfessionals.find((cp) => cp.proId === uuid);
    if (connectedPro) {
      // If they are already in the "connectedProfessionals[]" array
      // Then just update the new "socket.id"
      // console.log(connectedPro);
      connectedPro.uuid = socket.id;
    } else {
      // Else push them to the "connectedProfessionals[]" array
      connectedProfessionals.push({
        socketId: socket.id,
        fullName: professionalsFullName,
        uuid,
      });
    }
    // Send the apptData to the professional
    // console.log(connectedProfessionals);
    const professionalAppointments = app.get("professionalAppointments");
    // console.log("============ Top decodedData 2 ===========");
    // console.log(decodedData);
    // console.log("============ Bottom decodedData 2 ===========");
    // console.log(professionalAppointments[0].professionalsFullName);
    // console.log(fullName);
    socket.emit(
      "apptData",
      professionalAppointments.filter(
        (pa) => pa.professionalsFullName === professionalsFullName
      )
    );
    // Loop though all known professionals and send to all professionals that joined
    for (const key in allKnownOffers) {
      if (allKnownOffers[key].professionalsFullName === professionalsFullName) {
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
    const pa = professionalAppointments.find(
      (pa) => pa.professionalsFullName === apptInfo.professionalsFullName
    );
    // console.log(professionalAppointments);
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
