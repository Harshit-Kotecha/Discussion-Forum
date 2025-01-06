import { Route, Routes, useNavigate } from "react-router-dom";
import { ConnectForm } from "./components/ConnectForm";
import { LiveVideo } from "./components/LiveVideo";

import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";

import "./App.css";
import LoginPage from "./login/Login";
import SignUpPage from "./login/Signup";


function App() {
  const navigate = useNavigate();
  const agoraClient = useRTCClient(
    AgoraRTC.createClient({
      codec: "vp8",
      mode: "rtc",
      logConfig: {
        level: "none", // Disable logs
      },
    })
  ); // Initialize Agora Client
  AgoraRTC.setLogLevel(4);

  const handleConnect = (channelName) => {
    navigate(`/via/${channelName}`); // on form submit, navigate to new route
  };
  

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route
        path="/"
        element={<ConnectForm connectToVideo={handleConnect} />}
      />
      <Route
        path="/via/:channelName"
        element={
          <AgoraRTCProvider client={agoraClient}>
            <LiveVideo />
          </AgoraRTCProvider>
        }
      />
    </Routes>
  );
}

export default App;
