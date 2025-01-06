import { useState } from "react";
import logo from "./../assets/react.svg";
// import ApiService from "../api/apiService";
// import { HostFormModel } from "../models/UserModel";
import ApiService from "../api/apiService";
import { apiUrls } from "../api/apiUrls";
import EmailInput from "./emailInput";

export const ConnectForm = ({ connectToVideo }) => {
  const [channelName, setChannelName] = useState("");
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  const [emails, setEmails] = useState([]);
  const [invalidInputMsg, setInvalidInputMsg] = useState("");

  const handleConnect = (e) => {
    e.preventDefault();

    const data = {
      email: localStorage.getItem("email"),
      channel_name: channelName,
      judges: emails,
      topic: topic,
      agenda: agenda,
    };
    const apiService = new ApiService();
    apiService
      .post(apiUrls.judges, data)
      .then((data) => {
        const trimmedChannelName = channelName.trim();

        // validate input: make sure channelName is not empty
        if (trimmedChannelName === "") {
          e.preventDefault(); // keep the page from reloading on form submission
          setInvalidInputMsg("Channel name can't be empty."); // show warning
          setChannelName(""); // resets channel name value in case user entered blank spaces
          return;
        }

        connectToVideo(trimmedChannelName);
        console(data, "success");
        // navigate('/')
      })
      .catch((error) => console.error("Error", error));

    // trim spaces
  };

  return (
    // <div style={{backgroundColor: 'gray'}}>
    // <form onSubmit={handleConnect}>
    //   <img src={logo} className="logo " alt="logo" />
    //   <div className="card">
    //     <input
    //       id="channelName"
    //       type="text"
    //       placeholder="Channel Name"
    //       value={channelName}
    //       onChange={(e) => {
    //         setChannelName(e.target.value);
    //         setInvalidInputMsg(""); // clear the error message
    //       }}
    //     />
    //     <EmailInput></EmailInput>
    //     {/* <ChatGPTRelevanceChecker></ChatGPTRelevanceChecker> */}

    //     <button>Connect</button>
    //     {invalidInputMsg && <p style={{ color: "red" }}> {invalidInputMsg} </p>}
    //   </div>
    // </form>
    // </div>
    <div
      style={{
        backgroundColor: "#2c3e50",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleConnect}
        style={{
          backgroundColor: "#ecf0f1",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <img
          src={logo}
          alt="logo"
          style={{
            width: "80px",
            marginBottom: "20px",
          }}
        />
        <h2
          style={{
            marginBottom: "20px",
            fontFamily: "Arial, sans-serif",
            color: "#34495e",
          }}
        >
          Connect to Channel
        </h2>
        <div style={{ marginBottom: "15px" }}>
          <input
            id="channelName"
            type="text"
            placeholder="Enter Channel Name"
            value={channelName}
            onChange={(e) => {
              setChannelName(e.target.value);
              setInvalidInputMsg(""); // clear the error message
            }}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #bdc3c7",
              borderRadius: "5px",
              marginBottom: "10px",
              fontSize: "16px",
              background: "white",
            }}
          />
          <h2
            style={{
              marginBottom: "10px",
              fontFamily: "Arial, sans-serif",
              color: "#34495e",
            }}
          >
            Topic
          </h2>
          <div style={{ marginBottom: "15px" }}>
            <input
              id="topic"
              type="text"
              placeholder="Enter Topic"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setInvalidInputMsg(""); // clear the error message
              }}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #bdc3c7",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "16px",
                background: "white",
              }}
            />
          </div>

          <h2
            style={{
              marginBottom: "10px",
              fontFamily: "Arial, sans-serif",
              color: "#34495e",
            }}
          >
            Agenda
          </h2>
          <div style={{ marginBottom: "15px" }}>
            <input
              id="agenda"
              type="text"
              placeholder="Enter Agenda"
              value={agenda}
              onChange={(e) => {
                setAgenda(e.target.value);
                setInvalidInputMsg(""); // clear the error message
              }}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #bdc3c7",
                borderRadius: "5px",
                marginBottom: "10px",
                fontSize: "16px",
                background: "white",
              }}
            />
          </div>
        </div>
        <EmailInput emails={emails} setEmails={setEmails} />

        <button
          type="submit"
          style={{
            backgroundColor: "#2980b9",
            color: "#fff",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
          }}
        >
          Connect
        </button>
        {invalidInputMsg && (
          <p
            style={{
              color: "red",
              marginTop: "10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            {invalidInputMsg}
          </p>
        )}
      </form>
    </div>
  );
};
