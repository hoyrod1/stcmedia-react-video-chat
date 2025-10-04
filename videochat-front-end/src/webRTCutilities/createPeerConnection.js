import peerConfiguration from "./stunServers";

const createPeerConnection = (addIce) => {
  return new Promise(async (resolve, reject) => {
    const peerConnection = await new RTCPeerConnection(peerConfiguration);
    // rtcPeerConnection is the connection to the peer.
    // We may need more than one.
    // We pass the "peerConfiguration" to "RTCPeerConnection".
    // This will get the ICE candidates.
    const remoteStream = new MediaStream();
    // Event listener to listen for a Signaling state change //
    peerConnection.addEventListener("signalingstatechange", (e) => {
      console.log(`Signaling State Change`);
      console.log(e);
    });

    // Event listener to listen for a Signaling state change
    peerConnection.addEventListener("icecandidate", (e) => {
      console.log(`Found ICE candidtaes....`);
      if (e.candidate) {
        // Emit to socket server
        addIce(e.candidate);
      }
    });
    peerConnection.addEventListener("track", (e) => {
      console.log("Got a track from the remote!", e);
      e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track, remoteStream);
        console.log("Fingers crossed...");
        console.log(track);
      });
    });
    resolve({
      peerConnection,
      remoteStream,
    });
  });
};

export default createPeerConnection; //
