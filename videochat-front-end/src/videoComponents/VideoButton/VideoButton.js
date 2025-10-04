import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import addStream from "../../redux-elements/actions/addStream";
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";
import getDevices from "../../webRTCutilities/getDevices";
import CaretDropDown from "../CaretDropDown";
import startLocalVideoStream from "./startLocalVideoStream";

const VideoButton = ({ smallFeedEl }) => {
  //========================================================//
  const dispatch = useDispatch();
  const callStatus = useSelector((state) => state.callStatus);
  const streams = useSelector((state) => state.streams);
  const [pendingUpdate, setPendingUpdate] = useState(false);
  const [caretOpen, setCaretOpen] = useState(false);
  const [videoDeviceList, setVideoDeviceList] = useState([]);
  //========================================================//

  //========================================================//
  // const DropDown = () => {};
  //========================================================//

  //========================================================//
  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        // Check for video devices
        const devices = await getDevices();
        // console.log(devices.videoDevices);
        setVideoDeviceList(devices.videoDevices);
      }
    };
    getDevicesAsync();
  }, [caretOpen]); //
  //========================================================//

  //========================================================//
  const changeVideoDevice = async (e) => {
    // The user changes the current video device being used
    // 1. We need to get the deviceId
    const deviceId = e.target.value;
    // 2. We need to get (permission) from getUserMedia
    const newConstraints = {
      video: {
        deviceId: {
          exact: deviceId,
        },
      },
      audio:
        callStatus.audioDevice === "default"
          ? true
          : {
              deviceId: {
                exact: callStatus.audioDevice,
              },
            },
    };

    const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
    // 3. We need to update redux with the selected videoDevice and that video is enabled
    dispatch(updateCallStatus("videoDevice", deviceId));
    dispatch(updateCallStatus("video", "enabled"));
    // 4. We need to update the smallFeedEl
    smallFeedEl.current.srcObject = stream;
    // 5. Update stream in localStream
    dispatch(addStream("localStream", stream));
    // 6. We need to add the tracks
    const tracks = stream.getVideoTracks();
    // Come back to this later
    // If we stop the old video/audio track and add new video/audio track
    // We have to renegotiate
  };
  //========================================================//

  //========================================================//
  const startStopVideo = () => {
    // console.log(`Sanity Check!!!`);
    if (callStatus.video === "enabled") {
      // 1. CHECK IF THE VIDEO IS ENABLED, IF SO DISABLE IT
      // Update redux callStatus
      dispatch(updateCallStatus("video", "disabled"));
      // Set the stream to disable
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((track) => {
        track.enabled = false;
      });
    } else if (callStatus.video === "disabled") {
      // 2. CHECK IF THE VIDEO IS DISABLED. IF SO ENABLE IT
      // First update redux callStatus
      dispatch(updateCallStatus("video", "enabled"));
      // Then set the stream to disable
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((track) => {
        track.enabled = true;
      });
    } else if (callStatus.haveMedia) {
      // 3. CHECK IF THERE IS MEDIA AVAIBALE, IF SO, START STREAM
      // We have media show stream
      smallFeedEl.current.srcObject = streams.localStream.stream;
      // Add tracks to peerConnection
      startLocalVideoStream(streams, dispatch);
    } else {
      // 4. IF THERE IS NO MEDIA WAIT FOR IT (async) THEN ENABLE IT
      setPendingUpdate(true);
    }
  };
  //========================================================//

  //========================================================//
  useEffect(() => {
    if (pendingUpdate && callStatus.haveMedia) {
      console.log(`Pending update succeeded!!!`);
      // This useEffect will run if pendingUpdate changes to true
      setPendingUpdate(false);
      smallFeedEl.current.srcObject = streams.localStream.stream;
      startLocalVideoStream(streams, dispatch);
    }
  }, [pendingUpdate, callStatus.haveMedia]);
  //========================================================//

  //========================================================//
  const setStyle = { color: "white" };
  return (
    <div style={setStyle} className='button-wrapper video-button d-inline-block'>
      <i
        className='fa fa-caret-up choose-video'
        onClick={() => setCaretOpen(!caretOpen)}
      ></i>
      <div style={setStyle} className='button camera' onClick={startStopVideo}>
        <i className='fa fa-video'></i>
        <div className='btn-text'>
          {callStatus.video === "enabled" ? "Stop" : "Start"} Video
        </div>
      </div>
      {caretOpen ? (
        <CaretDropDown
          defaultValue={callStatus.videoDevice}
          changeHandler={changeVideoDevice}
          deviceList={videoDeviceList}
          type='video'
        />
      ) : (
        <></>
      )}
    </div>
  );
  //========================================================//
};

export default VideoButton; //
