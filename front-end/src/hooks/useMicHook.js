import { useEffect, useState } from "react";

const useMic = ()=> { 
    const [isListening, setIsListening] = useState(false);
    const [note, setNote] = useState(null);
    const [savedNotes, setSavedNotes] = useState([]);
  
    useEffect(() => {
      handleListen();
    }, [isListening]);
  
    const handleListen = () => {
      if (isListening) {
        mic.start();
        mic.onend = () => {
          console.log("continue..");
          mic.start();
        };
      } else {
        mic.stop();
        mic.onend = () => {
          console.log("Stopped Mic on Click");
        };
      }
      mic.onstart = () => {
        console.log("Mics on");
      };
  
      mic.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        console.log(transcript);
        setNote(transcript);
        mic.onerror = (event) => {
          console.log(event.error);
        };
      };
    };
  
    const handleSaveNote = () => {
      setSavedNotes([...savedNotes, note]);
      setNote("");
    };
  return {
    handleListen,
    handleSaveNote,
    isListening,
    note,
    setIsListening,
    setNote,
    setSavedNotes,
    savedNotes,
  }
}

export default useMic;