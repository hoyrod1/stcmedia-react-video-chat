export default (who, stream, peerConnection) => {
  return {
    type: "ADD_STREAM",
    payload: {
      who,
      stream,
      peerConnection, // Before local connection is made this will be undefined //
    },
  };
};

// const addStream = (who, stream, peerConnection) => {
//   return {
//     type: "ADD_STREAM",
//     payload: {
//       who,
//       stream,
//       peerConnection, // Before local connection is made this will be undefined //
//     },
//   };
// };

// export default addStream; //
