const initState = {
  current: "idle", //negotiating, progress, complete
  video: "off", //video feed status: "off" "enabled" "disabled" "complete"
  audio: "off", //audio feed status: "off" "enabled" "disabled" "complete" //
  audioDevice: "default", //enumerate devices, chosen audio input device (we dont care about the output device)
  videoDevice: "default",
  shareScreen: false,
  haveMedia: false, //is there a localStream, has getUserMedia been ran //
  haveCreatedOffer: false,
};

export default (state = initState, action) => {
  if (action.type === "UPDATE_CALL_STATUS") {
    const copyState = { ...state };
    console.log(action);
    copyState[action.payload.prop] = action.payload.value;
    // console.log(copyState.video);
    // console.log(copyState.audio);
    return copyState;
  } else if (action.type === "LOGOUT_ACTION" || action.type === "NEW_VERSION") {
    console.log(initState.video);
    console.log(initState.audio);
    return initState;
  } else {
    return state;
  }
};
