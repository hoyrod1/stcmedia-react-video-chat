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
        const { peerConnection, remoteStream } = await createPeerConnection();
        // At this point we do not know who is connected to the chat app yet
        dispatch(addStream("remote1", remoteStream, peerConnection));
        // Now we have a peerConnection but cannot make an offer yet.
        // Require the SDP = information about the video feed and we have no tracks
        // socket.emit...
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
    //==================================================//
    const createOfferAsync = async () => {
      // We have audio and video we need to make an offer
      for (const s in streams) {
        // console.log(s);
        if (s !== "localStream") {
          try {
            const pc = streams[s].peerConnection;
            const offer = await pc.createOffer();
            // "get" THE "token" VARIABLE FROM THE QUERY STRING
            const token = searchParams.get("token");
            // Get the socket connection from the "socketConnection"
            const socket = socketConnection(token);
            socket.emit("newOffer", { offer, apptInfo });
            // console.log(pc);
          } catch (error) {
            console.log(error);
          }
        }
      }
      // Update call status
      dispatch(updateCallStatus("haveCreatedOffer", true));
    };
    //==================================================//

    //==================================================//
    if (
      callStatus.audio === "enabled" &&
      callStatus.video === "enabled" &&
      !callStatus.haveCreatedOffer
    ) {
      createOfferAsync();
    }
    //==================================================//
  }, [callStatus.audio, callStatus.video, callStatus.haveCreatedOffer]);
  //------------------------------------------------------------------------//

  //------------------------------------------------------------------------//
  useEffect(() => {
    // "get" THE "token" VARIABLE FROM THE QUERY STRING
    const token = searchParams.get("token");
    //console.log(token);
    const fetchDecodedToken = async () => {
      const resp = await axios.post("https://localhost:9000/validate-link", { token });
      // console.log(resp.data);
      setApptInfo(resp.data);
    };
    fetchDecodedToken();
  }, []);
  //------------------------------------------------------------------------//

  return (
    <div className='main-video-page'>
      <div className='video-chat-wrapper'>
        {/* DIV TO HOLD OUR REMOTE VIDEO, OUR LOCAL VIDEO AND OUR CHAT WINDOW */}
        <video id='large-feed' ref={largeFeedEl} autoPlay controls playsInline></video>
        <video id='own-feed' ref={smallFeedEl} autoPlay controls playsInline></video>
        {apptInfo.professionalsFullName ? <CallInfo apptInfo={apptInfo} /> : <></>}
        <ChatWindow />
      </div>
      <ActionButtons smallFeedEl={smallFeedEl} />
    </div>
  );
};

export default MainVideoPage;
