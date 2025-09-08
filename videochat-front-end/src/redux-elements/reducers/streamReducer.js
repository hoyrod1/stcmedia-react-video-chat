// This file holds all the streams as objects
// local, remote, remote2, remote+++
//======================= example =======================//
// {
//    who
//    stream = this contians the tracks that plays in the
//    peerconnection = This is the webRTC connection
//  }
//========================================================//

//========================================================//
// local, remote, remote2, remote+++
export default (state = {}, action) => {
  if (action.type === "ADD_STREAM") {
    const copyState = { ...state };
    copyState[action.payload.who] = action.payload;
    return copyState;
  } else if (action.type === "LOGOUT_ACTION") {
    return {};
  } else {
    return state;
  }
};
//========================================================//
