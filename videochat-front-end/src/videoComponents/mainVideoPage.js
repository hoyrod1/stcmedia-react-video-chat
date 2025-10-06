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
import clientSocketListeners from "../webRTCutilities/clientSocketListeners";

const MainVideoPage = () => {
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  // USE THE "get" QUERY FINDER HOOK //
  const [searchParams] = useSearchParams();
  const [apptInfo, setApptInfo] = useState({});
  // "useRef()" IS USED TO INTERACT WITH DOM ELEMENT
  const smallFeedEl = useRef(null);
  const largeFeedEl = useRef(null);
  const uuidRef = useRef(null);
  const streamsRef = useRef(null);
  const [showCallInfo, setShowCallInfo] = useState(true);
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
        console.log(stream);
        dispatch(updateCallStatus("haveMedia", true)); // Update the call status
        // Dispatch will send this function to the redux dispatcher so all reducers are notified
        // We send the 2 arguments the "who" and the "stream"
        dispatch(addStream("localStream", stream));
        const { peerConnection, remoteStream } = await createPeerConnection(addIce);
        // console.log(remoteStream);
        // console.log(peerConnection);
        // At this point we do not know who is connected to the chat app yet
        dispatch(addStream("remote1", remoteStream, peerConnection));
        // Now we have a peerConnection but cannot make an offer yet.
        // Require the SDP = information about the video feed and we have no tracks
        // socket.emit...
        // When we have the remote stream from the peerConnection.
        // Set "largeFeedEl" video feed to "remoteStream" just created
        // This line is the same as "ProMainVideoPage.js"
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
    // We cannot update streamsRef until we know redux is finished
    if (streams.remote1) {
      streamsRef.current = streams;
    }
  }, [streams]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    //======================================================================//
    const createOfferAsync = async () => {
      // We have audio and video we need to make an offer
      for (const s in streams) {
        // console.log(s);
        if (s !== "localStream") {
          try {
            console.log(streams);
            const pc = streams[s].peerConnection;
            const offer = await pc.createOffer();
            // console.log(offer);
            pc.setLocalDescription(offer);
            // console.log(pc);
            // console.log(pc.signalingState); // Should be have remote offer
            // "get" THE "token" VARIABLE FROM THE QUERY STRING
            const token = searchParams.get("token");
            // Get the socket connection from the "socketConnection"
            const socket = socketConnection(token);
            socket.emit("newOffer", { offer, apptInfo });
            // console.log(pc);
            // Add event listeners
            // clientSocketListeners(socket, dispatch);
          } catch (error) {
            console.log(error);
          }
        }
      }
      // Update call status
      dispatch(updateCallStatus("haveCreatedOffer", true));
    };
    //======================================================================//

    //======================================================================//
    if (
      callStatus.audio === "enabled" &&
      callStatus.video === "enabled" &&
      !callStatus.haveCreatedOffer
    ) {
      createOfferAsync();
    }
    //======================================================================//
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    //======================================================================//
    const asyncAddAnswer = async () => {
      // Listen for changes to callStatus.answer
      // If it exist we have an answer
      for (const s in streams) {
        if (s !== "localStream") {
          const pc = streams[s].peerConnection;
          await pc.setRemoteDescription(callStatus.answer);
          console.log(pc.signalingState);
          console.log("Answer Added");
        }
      }
    };
    //======================================================================//

    //======================================================================//
    if (callStatus.answer) {
      asyncAddAnswer();
    }
    //======================================================================//
  }, [callStatus.answer]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    //console.log(token);
    const fetchDecodedToken = async () => {
      const resp = await axios.post("https://api.liveebonyshow.com/validate-link", {
        token,
      });
      console.log(resp.data);
      setApptInfo(resp.data);
      uuidRef.current = resp.data.uuid;
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
    clientSocketListeners(socket, dispatch, addIceCandidateToPc);
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
      setShowCallInfo(false);
    }
  };
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  const addIce = (iceC) => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    // Emit a new icecandidate to the signaling server
    const socket = socketConnection(token);
    socket.emit("iceToServer", {
      iceC,
      who: "client",
      uuid: uuidRef.current, // We used a useRef to keep the value uuid fresh
    });
  };
  //------------------------------------------------------------------------//

  return (
    <div className='main-video-page'>
      <div className='video-chat-wrapper'>
        {/* DIV TO HOLD OUR REMOTE VIDEO, OUR LOCAL VIDEO AND OUR CHAT WINDOW */}
        <video id='large-feed' ref={largeFeedEl} autoPlay controls playsInline></video>
        <video id='own-feed' ref={smallFeedEl} autoPlay controls playsInline></video>
        {showCallInfo ? <CallInfo apptInfo={apptInfo} /> : <></>}
        <ChatWindow />
      </div>
      <ActionButtons smallFeedEl={smallFeedEl} largeFeedEl={largeFeedEl} />
    </div>
  );
};

export default MainVideoPage;
