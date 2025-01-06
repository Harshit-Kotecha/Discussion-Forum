import { useEffect, useState } from "react";
import ApiService from "../api/apiService";
import { apiUrls } from "../api/apiUrls";

export function useUserMode({ channelName }) {
  const [isUserJudge, setIsUserJudge] = useState(false);
  const [topic, setTopic] = useState("");
  const [agenda, setAgenda] = useState("");
  // const [judgesList, setJudgesList] = useState([]);

  // call api to get judgesList
  useEffect(() => {
    const apiService = new ApiService();
    apiService
      .get(apiUrls.judges, { channel_name: channelName })
      .then((data) => {
        // setJudgesList(data?.judges);
        setTopic(data?.topic);
        setAgenda(data?.agenda);

        const userEmail = localStorage.getItem("email");
        if (data.judges?.find((v) => v === userEmail)) {
          setIsUserJudge(true);
        }
        // navigate('/')
      })
      .catch((error) => console.error("Error", error));
  }, []);

  return { isUserJudge, topic, agenda };
}
