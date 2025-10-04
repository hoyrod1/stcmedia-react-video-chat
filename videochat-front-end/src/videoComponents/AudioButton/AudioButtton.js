import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import addStream from "../../redux-elements/actions/addStream";
import updateCallStatus from "../../redux-elements/actions/updateCallStatus";
import getDevices from "../../webRTCutilities/getDevices";
import CaretDropDown from "../CaretDropDown";
import startAudioStream from "./startAudioStream";

const AudioButton = (smallFeedEl) => {
  //===========================================================//
  const dispatch = useDispatch();
  const streams = useSelector((state) => state.streams);
  const callStatus = useSelector((state) => state.callStatus);
  const [audioDeviceList, setAudioDeviceList] = useState([]);
  const [caretOpen, setCaretOpen] = useState(false);
  //===========================================================//

  //===========================================================//
  let micText;
  if (callStatus.audio === "off") {
    micText = "Join Audio";
  } else if (callStatus.audio === "enabled") {
    micText = "Mute";
  } else {
    micText = "Unmute";
  }
  //===========================================================//

  //===========================================================//
  useEffect(() => {
    const getDevicesAsync = async () => {
      if (caretOpen) {
        // Check for video audio devices
        // Note; when the audio is set to false //
        // the caret dropdown option list will not be available //
        const devices = await getDevices();
        // console.log(devices);
        // console.log(devices.audioInputDevices);
        // console.log(devices.audioOutputDevices);
        setAudioDeviceList(devices.audioOutputDevices.concat(devices.audioInputDevices));
      }
    };
    getDevicesAsync();
  }, [caretOpen]);
  //===========================================================//

  //===========================================================//
  const startStopAudio = (e) => {
    //console.log(e);
    // console.log(`Sanity Check!!!`);
    if (callStatus.audio === "enabled") {
      // 1. CHECK IF THE VIDEO IS ENABLED, IF SO DISABLE IT
      // Update redux callStatus
      dispatch(updateCallStatus("audio", "disabled"));
      // Set the stream to disable
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = false;
      });
    } else if (callStatus.audio === "disabled") {
      // 2. CHECK IF THE VIDEO IS DISABLED. IF SO ENABLE IT
      // Update redux callStatus
      dispatch(updateCallStatus("audio", "enabled"));
      // Set the stream to disable
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = true;
      });
    } else {
      // Audio is "off" What do we do?
      changeAudioDevice({ target: { value: "inputdefault" } });
      // Add the tracks
      startAudioStream(streams);
    }
  };
  //===========================================================//

  //===========================================================//
  const changeAudioDevice = async (e) => {
    // The user changes the current output or input audio device being used
    // 1. We need to get the deviceId
    const deviceId = e.target.value.slice(5);
    const audioType = e.target.value.slice(0, 5);
    console.log(e.target.value);
    // console.log(audioType);
    if (audioType === "ouput") {
      const audioType = e.target.value.slice(0, 5);
      // console.log(audioType);
      // console.log(deviceId);
      // 2. We need to update the smallFeedEl
      // We are setting audio output in case the user
      // is using a different output device like headphones
      smallFeedEl.current.setSinkId(deviceId); // Line is commented out until we have a different output device.
    } else if (audioType === "input") {
      // console.log(audioType);
      // console.log(deviceId);
      // 2. We need to get (permission) from getUserMedia
      const newConstraints = {
        audio: {
          deviceId: {
            exact: deviceId,
          },
        },
        video:
          callStatus.videoDevice === "default"
            ? true
            : {
                deviceId: {
                  exact: callStatus.videoDevice,
                },
              },
      };
      const stream = await navigator.mediaDevices.getUserMedia(newConstraints);
      // 3. We need to update redux with the selected videoDevice and that video is enabled
      dispatch(updateCallStatus("audioDevice", deviceId));
      dispatch(updateCallStatus("audio", "enabled"));
      // 4. Update stream in localStream
      dispatch(addStream("localStream", stream));
      // 5. We need to add/replace the tracks
      const tracks = stream.getAudioTracks();
      // Come back to this later
      // If we stop the old video/audio track and add new video/audio track
      // We have to renegotiate
    }
  };
  //===========================================================//

  //===========================================================//
  const setStyle = { color: "white" };
  //===========================================================//
  return (
    <div style={setStyle} className='button-wrapper d-inline-block'>
      <i
        className='fa fa-caret-up choose-audio'
        onClick={() => setCaretOpen(!caretOpen)}
      ></i>
      <div className='button mic' onClick={startStopAudio}>
        <i className='fa fa-microphone'></i>
        <div className='btn-text'>{micText}</div>
      </div>
      {caretOpen ? (
        <CaretDropDown
          defaultValue={callStatus.audioDevice}
          changeHandler={changeAudioDevice}
          deviceList={audioDeviceList}
          type='audio'
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default AudioButton; //
