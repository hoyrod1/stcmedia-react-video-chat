// Function job is to update all peerConnections (addTracks) and update redux callStatus
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";

const startLocalVideoStream = (streams, dispatch) => {
  //console.log(streams);
  // console.log(dispatch);
  const localStream = streams.localStream;
  //console.log(thisLocalStream);
  for (const s in streams) {
    if (s !== "localStream") {
      // console.log(`This ${s}, does not equal localStream`);
      // We don't add tracks to the localStream
      const curStream = streams[s];
      // Add tracks to all peerConnections
      localStream.stream.getVideoTracks().forEach((track) => {
        curStream.peerConnection.addTrack(track, streams.localStream.stream);
        // console.log(track, curStream.stream);
      });
      // Update redux callStatus in callStatusReducer.js file
      dispatch(updateCallStatus("video", "enabled"));
    }
    // console.log(`This ${s}, equals localStream`);
    // console.log(`This ${streams[s]}, equals localStream`);
  }
};

export default startLocalVideoStream;
