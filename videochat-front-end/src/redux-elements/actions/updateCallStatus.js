// THIS OBJECT WILL BE NAMED "action" AS THE PARAMETER the "callStatusReducer.js" FILE //
export default (prop, value) => {
  return {
    type: "UPDATE_CALL_STATUS",
    payload: { prop, value },
  };
}; //
