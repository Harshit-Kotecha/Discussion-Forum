import { useEffect, useState } from "react";

export const useLocalUserMic = (usersAllowedToSpeakByJudges, isUserJudge) => {
  const [isLocalUserAllowedToSpeak, setIsLocalUserAllowedToSpeak] =
    useState(false);

  useEffect(() => {
    if (isUserJudge) {
      setIsLocalUserAllowedToSpeak(true);
    }
  }, [usersAllowedToSpeakByJudges, isUserJudge]);

  return { isLocalUserAllowedToSpeak };
};
