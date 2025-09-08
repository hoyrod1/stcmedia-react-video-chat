import { combineReducers } from "redux";
import callStatusReducer from "./callStatusReducer";
import streamReducer from "./streamReducer";

const rootReducer = combineReducers({
  callStatus: callStatusReducer,
  streams: streamReducer,
});

export default rootReducer; //
