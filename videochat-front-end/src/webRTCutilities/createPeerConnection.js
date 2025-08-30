import peerConfiguration from "./stunServers";

const createPeerConnection = () => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(peerConfiguration);
    // rtcPeerConnection is the connection to the peer.
    // We may need more than one.
    // We pass the "peerConfiguration" to "RTCPeerConnection".
    // This will get the ICE candidates.
    const remoteStream = new MediaStream();
    // Event listener to listen for a Signaling state change
    // peerConnection.addEventListener("signalingstatechange", (e) => {
    //   //console.log(`Signaling State Change occured ${e}`);
    // });

    // Event listener to listen for a Signaling state change
    peerConnection.addEventListener("icecandidates", (e) => {
      console.log(`Found ICE candidtaes....`);
      if (e.candidate) {
        // Emit to socket server
      }
    });
    resolve({
      peerConnection,
      remoteStream,
    });
  });
};

export default createPeerConnection;
