import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
//import socketConnection from "./webRTCutilities/socketConnection";
import MainVideoPage from "./videoComponents/mainVideoPage";

const Home = () => <h1>Welcome To STC media Web Chat App Home Page</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' Component={Home} />
        <Route path='/join-video' Component={MainVideoPage} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
