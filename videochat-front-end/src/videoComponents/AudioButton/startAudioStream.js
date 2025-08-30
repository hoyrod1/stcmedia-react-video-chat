const startAudioStream = (streams) => {
  //console.log(streams);
  // console.log(dispatch);
  const localStream = streams.localStream;
  //console.log(thisLocalStream);
  for (const s in streams) {
    if (s !== "localStream") {
      // We don't add tracks to the localStream
      const curStream = streams[s];
      // Add tracks to all peerConnections
      localStream.stream.getAudioTracks().forEach((track) => {
        curStream.peerConnection.addTrack(track, streams.localStream.stream);
      });
    }
  }
};

export default startAudioStream;
