import updateCallStatus from "../redux-elements/actions/updateCallStatus";

const clientSocketListeners = (socket, dispatch, addIceCandidateToPc) => {
  socket.on("änswerToClient", (answer) => {
    console.log(answer);
    // Dispatch the offer to redux so that it is available for later //
    dispatch(updateCallStatus("answer", answer));
    dispatch(updateCallStatus("myRole", "offerer"));
  });

  socket.on("iceToClient", (iceC) => {
    addIceCandidateToPc(iceC);
  });
};

export default clientSocketListeners;
