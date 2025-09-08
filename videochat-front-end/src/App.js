import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
//import socketConnection from "./webRTCutilities/socketConnection";
import MainVideoPage from "./videoComponents/mainVideoPage";
import ProDashboard from "./siteComponents/proDashboard";
import ProMainVideoPage from "./videoComponents/ProMainVideoPage";

const Home = () => <h1>Welcome To STC media Web Chat App Home Page</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' Component={Home} />
        <Route path='/join-video' Component={MainVideoPage} />
        <Route exact path='/dashboard' Component={ProDashboard} />
        <Route exact path='/join-video-pro' Component={ProMainVideoPage} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
