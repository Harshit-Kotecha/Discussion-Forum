import {
  LocalUser,
  RemoteUser,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import ApiService from "../api/apiService.js";
import { apiUrls } from "../api/apiUrls.js";
import { useUserMode } from "../hooks/useUserMode";
import call from "./../assets/call.svg";
import camera from "./../assets/camera.svg";
import graph from "./../assets/graph.svg";
import micImg from "./../assets/mic.svg";
import mute from "./../assets/mute.svg";
import timer from "./../assets/timer.svg";
import AlertPopup from "./AlertPopup.jsx";
import GraphComponent from "./GraphComponent";

export const LiveVideo = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = new SpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);

  const [judgesHandlers, setJudgesHandlers] = useState(null);

  const apiKey = import.meta.env.VITE_OPEN_AI_API_KEY;

  const [showGraph, setShowGraph] = useState(false);
  const handleListen = () => {
    if (isListening) {
      mic.start();
      mic.onstart = () => {};

      mic.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        console.log(transcript, " --- transcirpt");
        setNote((a) => (a || "") + transcript);
      };

      mic.onerror = (event) => {
        console.error("Mic Error:", event.error);
      };

      mic.onend = () => {
        // console.log("Mic stopped, restarting...");
        if (isListening) mic.start(); // Restart mic if still listening
      };
    } else {
      mic.stop();
      mic.onend = () => {
        console.log("Stopped Mic on Click");
      };
    }
  };

  useEffect(() => {
    handleListen();
    return () => {
      mic.stop();
      mic.onend = null;
      mic.onresult = null;
      mic.onerror = null;
      mic.onstart = null;
    };
  }, [isListening]);

  const appId = import.meta.env.VITE_AGORA_APP_ID;
  const { channelName } = useParams();
  const [socket, setSocket] = useState(null);
  const [activeConnection, setActiveConnection] = useState(true);

  // track the video state - Turn on Mic and Camera On
  const [cameraOn, setCamera] = useState(true);

  const [alertMsg, setAlertMsg] = useState(null);

  // get local video and mic tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(true);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  const [usersSpeaking, setUsersSpeaking] = useState([]);
  const [usersRequestingToSpeak, setUsersRequestingToSpeak] = useState([]);

  const { isUserJudge, topic, agenda } = useUserMode({
    channelName: channelName,
  });

  // to leave the call
  const navigate = useNavigate();

  //remote users
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  const userEmail = localStorage.getItem("email");
  const username = localStorage.getItem("full_name");

  // play the remote user audio tracks
  audioTracks.forEach((track) => track.play());

  const [usernames, setUsernames] = useState({ userEmail: username }); // State to store usernames
  const [userPerformance, setUserPerformance] = useState([]);

  const fetchUsername = async (uid) => {
    try {
      const apiService = new ApiService();
      const response = await apiService.get(apiUrls.userName, {
        email: uid.split("_")[0],
      });
      return response?.name;
    } catch (error) {
      console.error(`Failed to fetch username for UID ${uid}:`, error);
      return "Unknown"; // Default value in case of an error
    }
  };

  useEffect(() => {
    const fetchAllUsernames = async () => {
      const updatedUsernames = {};
      for (const user of remoteUsers || []) {
        if (!usernames[user.uid]) {
          // Avoid redundant API calls
          const username = await fetchUsername(user.uid);
          updatedUsernames[user.uid] = username;
        }
      }
      setUsernames((prev) => ({ ...prev, ...updatedUsernames }));
    };

    fetchAllUsernames();
  }, [remoteUsers]);

  const handleMicClick = (uid) => {
    localStorage.setItem("lastCalledAt", null);
    let updatedUsersSpeaking = [];
    console.log(uid, " handle Mic click");
    if (isUserJudge) {
      if (usersSpeaking.includes(uid)) {
        updatedUsersSpeaking = usersSpeaking.filter((e) => e !== uid);
      } else {
        updatedUsersSpeaking = [...usersSpeaking, uid];
      }
      socket.emit("mic-permission", {
        channelName,
        allowedUsersToSpeak: updatedUsersSpeaking,
      });
      setUsersSpeaking(updatedUsersSpeaking);
    } else {
      // Not a judge and Already mic on
      if (usersSpeaking.includes(uid)) {
        updatedUsersSpeaking = usersSpeaking.filter((e) => e !== uid);
        socket.emit("mic-permission", {
          channelName,

          allowedUsersToSpeak: updatedUsersSpeaking,
        });
        return;
      }

      // Not a judge and mic off
      socket.emit("ask-judge-for-mic-permission", {
        uid,
        username,
      });
    }
  };

  const relativeData = [
    [50, 70, 10, 90, 10, 20, 30, 13, 90], // Initial state
    [80, 40, 60, 90, 10, 20, 30, 13, 90], // Update 1
    [30, 90, 20, 90, 10, 20, 30, 13, 90], // Update 2
    [10, 50, 80, 90, 10, 20, 30, 13, 90], // Update 3
  ];

  const checkRelevance = async () => {
    if (!topic || !note) {
      console.log(note, topic, "  --- exiting gpt");
      return;
    }

    const prompt = `Evaluate the relevance of the following text to the topic: "${topic}". and this is the agenda of the topic "${agenda}" The text is: "${note}". If not is empty, then please give 0 score. Also, reduce the score if the speaker is using too much abusing words. Please provide a relevance score from 1 to 10 and just provide me the score no other information is required only need an integer. `;
    try {
      console.log(note, " note calling gpt response");

      const result = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an assistant that evaluates text relevance to a given topic.",
            },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Get the response from the API
      const gptResponse = parseInt(result.data.choices[0].message.content);
      console.log({ gptResponse }, " gpt response --- ");
      const newuser = userPerformance.find((e) => e.email === userEmail);
      socket.emit("user-performance", {
        channelName,
        email: userEmail,
        score: newuser?.score ?? 0,
        relevance: gptResponse,
      });
      // setResponse(gptResponse);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      // setResponse("There was an error while fetching the response.");
    }
  };

  // Join the channel
  useJoin(
    {
      appid: appId,
      channel: channelName,
      token: null,
      uid: `${userEmail}_${channelName}`,
      username: "username",
    },
    activeConnection
  );
  usePublish([localMicrophoneTrack, localCameraTrack]);

  useEffect(() => {
    const socket = io.connect("http://localhost:3000", { reconnect: true });
    setSocket(socket);

    socket.on("connect", () => {
      console.log("Connected!", socket);
    });

    socket.emit("mic-permission", {
      channelName,
      allowedUsersToSpeak: usersSpeaking,
      isNewConnection: true,
    });

    socket.on("mic-permission", (data) => {
      console.log(data, "Mic Permission");
      setUsersSpeaking(data.allowedUsersToSpeak ?? []);
    });

    socket.on("timer-end", (data) => {
      setAlertMsg(data?.msg);
    });

    socket.on("can-i-speak", (data) => {
      console.log(data, " can i speak live video");
      // add user to list
      if (usersRequestingToSpeak.includes(data)) {
        return;
      }
      setUsersRequestingToSpeak([...usersRequestingToSpeak, data]);
    });

    socket.emit("all-users-performance", channelName);

    socket.on("all-users-performance", (data) => {
      console.log(data, " all users performance");
      setUserPerformance(data);
    });

    setSocket(socket);

    console.log("is user judge", isUserJudge, userEmail, username);

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    const lastCalledAt = getTimeDifferenceInMinutes();
    if (
      !lastCalledAt ||
      lastCalledAt >= 1 ||
      !usersSpeaking.includes(`${userEmail}_${channelName}`)
    ) {
      checkRelevance();
      localStorage.setItem("lastCalledAt", Date.now().toString());
    }
  }, [note, usersSpeaking]);

  // Function to evaluate time difference in minutes
  const getTimeDifferenceInMinutes = () => {
    const lastCalledAt = localStorage.getItem("lastCalledAt");
    if (!lastCalledAt) {
      console.log("No previous timestamp found");
      return null;
    }

    const lastTime = parseInt(lastCalledAt, 10); // Convert timestamp from string to number
    const currentTime = Date.now(); // Current timestamp in milliseconds
    const differenceInMinutes = (currentTime - lastTime) / (1000 * 60); // Difference in minutes

    console.log(`Time difference: ${differenceInMinutes.toFixed(2)} minutes`);
    return differenceInMinutes;
  };

  return (
    <>
      {alertMsg && (
        <AlertPopup message={alertMsg} onClose={() => setAlertMsg(null)} />
      )}
      {usersRequestingToSpeak.length > 0 && isUserJudge && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-10">
          <h3 className="text-lg font-semibold mb-4">Allow Users to Speak</h3>
          <ul className="space-y-3">
            {usersRequestingToSpeak.map((user, index) => (
              <li
                key={index}
                className="flex justify-between items-center border-b pb-2 last:border-none"
              >
                <span className="text-sm font-medium text-red">
                  {user.username}
                </span>
                <div className="flex space-x-2">
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded ${"bg-green-500 text-white"}`}
                    onClick={() => {
                      usersSpeaking.push(user.uid);
                      const newLs = usersRequestingToSpeak.filter(
                        (e) => e.id !== user.id
                      );
                      setUsersRequestingToSpeak(newLs);
                      socket.emit("mic-permission", {
                        channelName,
                        allowedUsersToSpeak: usersSpeaking,
                      });
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded ${"bg-gray-200 text-gray-700"}`}
                    onClick={() => {
                      const newLs = usersRequestingToSpeak.filter(
                        (e) => e.id !== user.id
                      );
                      setUsersRequestingToSpeak(newLs);
                    }}
                  >
                    No
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div id="remoteVideoGrid">
        {
          // Initialize each remote stream using RemoteUser component
          remoteUsers?.map((user) => (
            <div key={user.uid} className="p-8">
              <div key={user.uid}>
                <div
                  key={user.uid}
                  className="remote-video-container relative border-2 border-white"
                >
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm rounded px-2 py-1 z-10">
                    {usernames[user.uid] || ""}
                  </div>
                  {isUserJudge && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 flex space-x-4 text-white z-10  bg-gray-400 p-3 rounded-[20px]">
                      <div className="cursor-pointer">
                        <img
                          src={usersSpeaking.includes(user.uid) ? micImg : mute}
                          className=" size-[24px]"
                          alt="logo"
                        />
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          if (judgesHandlers) {
                            setJudgesHandlers(null);
                          } else {
                            setJudgesHandlers({
                              msg: "Enter Score",
                              type: "score",
                              value: 0,
                            });
                          }
                        }}
                      >
                        <img
                          src={graph}
                          className="   size-[24px]"
                          alt="logo"
                        />
                      </div>
                      <div
                        className="cursor-pointer"
                        onClick={() => {
                          if (judgesHandlers) {
                            setJudgesHandlers(null);
                          } else {
                            setJudgesHandlers({
                              msg: "Enter timer in minutes",
                              type: "timer",
                              value: 0,
                            });
                          }
                        }}
                      >
                        <img src={timer} className="  size-[24px]" alt="logo" />
                      </div>
                    </div>
                  )}
                  <RemoteUser
                    user={user}
                    micOn={usersSpeaking.includes(user.uid)}
                    playAudio={usersSpeaking.includes(user.uid)}
                  />
                </div>
                {judgesHandlers && (
                  <div className="w-full">
                    <input
                      type="number"
                      placeholder={judgesHandlers.msg}
                      className="w-full border border-gray-300 text-white rounded p-2"
                      max={10}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          try {
                            const value = parseInt(e.target.value);
                            if (judgesHandlers.type === "timer") {
                              setAlertMsg(
                                "The speaker is presenting now. All other mics are turned off."
                              );
                              socket.emit("user-timer", {
                                channelName,
                                uid: user.uid,
                                time: value,
                              });
                            } else {
                              const newuser = userPerformance.find(
                                (e) => e.email === userEmail
                              );
                              socket.emit("user-performance", {
                                channelName,
                                email: userEmail,
                                score: value,
                                relevance: newuser?.relevance ?? 0,
                              });
                            }
                            setJudgesHandlers(null);
                          } catch (e) {
                            console.log(e);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        }
      </div>
      {/* <div className="bg-red text-white">{note}</div> */}
      {/* <div className="bg-white">
        <ChatGPTRelevanceChecker
          adenda={agenda}
          topic={topic}
          text={note}
        ></ChatGPTRelevanceChecker>
      </div> */}

      {showGraph && (
        <GraphComponent
          relativeArrays={relativeData}
          intervalDuration={10000}
        />
      )}
      {/* </div> */}

      <div id="localVideo" className="border-2 border-white">
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-sm rounded px-2 py-1 z-10 ">
          {"You"}
        </div>
        <LocalUser
          audioTrack={localMicrophoneTrack}
          videoTrack={localCameraTrack}
          cameraOn={cameraOn}
          micOn={usersSpeaking.includes(`${userEmail}_${channelName}`)}
          playAudio={usersSpeaking.includes(`${userEmail}_${channelName}`)}
          // playAudio={false}
          playVideo={cameraOn}
          className=""
        />

        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-white border-2 border-black rounded-full p-4 z-50">
          {/* Call Button */}

          <div
            className="cursor-pointer px-4 border-r-2 border-black"
            onClick={() => {
              const uid = `${userEmail}_${channelName}`;
              handleMicClick(uid);
              setIsListening((a) => !a);
              // setNote("");
            }}
          >
            <img
              src={
                usersSpeaking.includes(`${userEmail}_${channelName}`)
                  ? micImg
                  : mute
              }
              className="   size-[24px]"
              alt="logo"
            />
          </div>

          {/* Camera Button */}
          <div
            className="cursor-pointer px-4 border-r-2 border-black"
            onClick={() => setCamera((a) => !a)}
          >
            <img src={camera} className="   size-[24px]" alt="logo" />
          </div>

          {/* End Button */}
          <div
            className="cursor-pointer px-4 border-r-2 border-black"
            onClick={() => {
              setActiveConnection(false);
              navigate("/");
            }}
          >
            <img src={call} className="   size-[24px]" alt="logo" />
          </div>

          {/* bar Button */}
          <div
            className="cursor-pointer px-4 z-10"
            onClick={() => {
              console.log("tap");
              setShowGraph((a) => !a);
            }}
          >
            <img
              src={
                "https://cdn.icon-icons.com/icons2/1458/PNG/512/graphbutton_99767.png"
              }
              className="size-[24px]"
              alt="logo"
            />
          </div>
        </div>
      </div>
    </>
  );
};
