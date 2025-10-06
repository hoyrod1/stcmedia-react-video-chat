import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "./VideoComponents.css";
import CallInfo from "./CallInfo";
import ChatWindow from "./ChatWindow";
import ActionButtons from "./ActionButtons";
import { useDispatch, useSelector } from "react-redux";
import addStream from "../redux-elements/actions/addStream";
import createPeerConnection from "../webRTCutilities/createPeerConnection";
import updateCallStatus from "../redux-elements/actions/updateCallStatus";
import socketConnection from "../webRTCutilities/socketConnection";
import proSocketListeners from "../webRTCutilities/proSocketListeners";

const ProMainVideoPage = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  // USE THE "get" QUERY FINDER HOOK //
  const [searchParams] = useSearchParams();
  const [apptInfo, setApptInfo] = useState({});
  // "useRef()" IS USED TO INTERACT WITH DOM ELEMENT
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  const [haveGottenIce, setHaveGottenIce] = useState(false);
  const streamsRef = useRef(null);
  //------------------------------------------------------------------------//
  useEffect(() => {
    // Fetch user media
    const fetchMedia = async () => {
      // Constraints for getUserMedia method
      const constraints = {
        video: true, // Must have one constraint true but don't enable
        audio: true, // When set to false caret dropdown option list will not be available
      };
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        dispatch(updateCallStatus("haveMedia", true)); // Update the call status
        // Dispatch will send this function to the redux dispatcher so all reducers are notified
        // We send the 2 arguments the "who" and the "stream"
        dispatch(addStream("localStream", stream));
        const { peerConnection, remoteStream } = await createPeerConnection(addIce);
        // At this point we do not know who is connected to the chat app yet
        dispatch(addStream("remote1", remoteStream, peerConnection));
        // Now we have a peerConnection but cannot make an offer yet.
        // Require the SDP = information about the video feed and we have no tracks
        // socket.emit...
        // When we have the remote stream from the peerConnection.
        // Set "largeFeedEl" video feed to "remoteStream" just created
        // This line is the same as "mainVideoPage.js"
        largeFeedEl.current.srcObject = remoteStream;
      } catch (error) {
        console.log(error);
      }
    };
    fetchMedia();
    // When using empty [], you will get a warming saying,
    // React Hook useEffect has a missing dependency: 'dispatch'
    // Either include it or remove the dependency array
  }, []);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    const getIceAsync = async () => {
      // "get" THE "token" VARIABLE FROM THE QUERY STRING
      const token = searchParams.get("token");
      // Emit a new icecandidate to the signaling server
      const socket = socketConnection(token);
      // "get" THE "uuid" VARIABLE FROM THE QUERY STRING
      const uuid = searchParams.get("uuid");
      const icaCandidates = await socket.emitWithAck("getIce", uuid, "professional");
      console.log("iceCandidate Recieved");
      console.log(icaCandidates);
      icaCandidates.forEach((iceC) => {
        for (const s in streams) {
          if (s !== "localStream") {
            const pc = streams[s].peerConnection;
            pc.addIceCandidate(iceC);
            console.log("=============== Added Ice Candidates ===============");
          }
        }
      });
    };
    if (streams.remote1 && !haveGottenIce) {
      setHaveGottenIce(true);
      getIceAsync();
      streamsRef.current = streams; // updating streamsRef once streams exist
    }
  }, [streams, haveGottenIce]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    const setAsyncOffer = async () => {
      for (const s in streams) {
        // console.log("================= 1 ================");
        // console.log(s);
        if (s !== "localStream") {
          const pc = streams[s].peerConnection;
          // console.log("================= 2 ================");
          // console.log(pc);
          await pc.setRemoteDescription(callStatus.offer);
          // console.log("================= 3 ================");
          // console.log(pc.signalingState); // Should be have remote offer
        }
      }
    };
    if (callStatus.offer && streams.remote1 && streams.remote1.peerConnection) {
      setAsyncOffer();
    }
  }, [callStatus.offer, streams.remote1]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    const createAnswerAsync = async () => {
      // We have audio and video, we can make an answer and setLocalDescription
      for (const s in streams) {
        if (s !== "localStream") {
          const pc = streams[s].peerConnection;
          // console.log("================= 4 ================");
          // console.log(streams);
          // console.log("================= 5 ================");
          // console.log(s);
          // This creates the answer //
          const answer = await pc.createAnswer();
          // Since this is the answering client, the answer is the localDescription
          await pc.setLocalDescription(answer);
          // console.log("================= 6 ================");
          console.log(pc.signalingState); // Should be have local answer
          dispatch(updateCallStatus("haveCreatedAnswer", true));
          dispatch(updateCallStatus("answer", answer));
          // Emit the answer to the server
          // "get" THE "token" VARIABLE FROM THE QUERY STRING
          const token = searchParams.get("token");
          const uuid = searchParams.get("uuid");
          const socket = socketConnection(token);
          socket.emit("newAnswer", { answer, uuid });
        }
      }
    };
    //==================================================//

    //==================================================//
    // We only create an "Answer" if audio, video are enabled and "callStatus.haveCreatedAnswer" is false
    // This may run many times, but these 3 events will only happen once
    if (
      callStatus.audio === "enabled" &&
      callStatus.video === "enabled" &&
      !callStatus.haveCreatedAnswer
    ) {
      createAnswerAsync();
    }
    //==================================================//
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedAnswer]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    // console.log(token);
    const fetchDecodedToken = async () => {
      const resp = await axios.post("https://api.liveebonyshow.com/validate-link", {
        token,
      });
      console.log(resp.data);
      setApptInfo(resp.data);
    };
    fetchDecodedToken();
  }, []);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  // iceToClient
  useEffect(() => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    const socket = socketConnection(token);
    proSocketListeners.proVideoSocketListeners(socket, addIceCandidateToPc);
  }, []);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  const addIceCandidateToPc = (iceC) => {
    // Add ice candidate from the remote to the peer connectiom
    for (const s in streamsRef.current) {
      if (s !== "localStream") {
        const pc = streamsRef.current[s].peerConnection;
        pc.addIceCandidate(iceC);
        console.log("Added an iceCandidate to existing page", pc);
      }
    }
  };
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  const addIce = (iceC) => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    // "get" THE "uuid" VARIABLE FROM THE QUERY STRING
    const professionalUuid = searchParams.get("uuid");
    // Emit a new icecandidate to the signaling server
    const socket = socketConnection(token);
    socket.emit("iceToServer", {
      iceC,
      who: "professional",
      uuid: professionalUuid,
    });
  };
  //------------------------------------------------------------------------//

  return (
    <div className='main-video-page'>
      <div className='video-chat-wrapper'>
        {/* DIV TO HOLD OUR REMOTE VIDEO, OUR LOCAL VIDEO AND OUR CHAT WINDOW */}
        <video id='large-feed' ref={largeFeedEl} autoPlay controls playsInline></video>
        <video id='own-feed' ref={smallFeedEl} autoPlay controls playsInline></video>
        {callStatus.audio === "off" || callStatus.video === "off" ? (
          <div className='call-info'>
            <h1>
              {searchParams.get("client")} has been notified.
              <br />
              Call will start when video and audio are enabled
            </h1>
          </div>
        ) : (
          <></>
        )}
        <ChatWindow />
      </div>
      <ActionButtons smallFeedEl={smallFeedEl} largeFeedEl={largeFeedEl} />
    </div>
  );
};

export default ProMainVideoPage;
