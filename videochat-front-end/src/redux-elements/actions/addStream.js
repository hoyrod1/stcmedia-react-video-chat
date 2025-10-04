// THIS OBJECT WILL BE NAMED "state" AS THE PARAMETER the "streamReducer.js" FILE //
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
