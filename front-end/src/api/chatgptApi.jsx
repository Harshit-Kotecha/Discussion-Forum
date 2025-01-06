import axios from "axios";
import { useState } from "react";

const ChatGPTRelevanceChecker = ({ topic, adenda: agenda, text }) => {
  // const [topic, setTopic] = useState('');
  // const [text, setText] = useState('');
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_OPEN_AI_API_KEY;

  // useEffect(() => {
  //   console.log("gpt response");

  //   const interval = setInterval(() => {
  //     console.log("gpt response 1");
  //     checkRelevance();
  //   }, 60000);

  //   // Cleanup function
  //   return () => clearInterval(interval);
  // }, []);

  const checkRelevance = async () => {
    if (!topic || !text) {
      // alert("Please provide both a topic and text.");
      return;
    }

    setLoading(true);

    const prompt = `Evaluate the relevance of the following text to the topic: "${topic}". and this is the agenda of the topic "${agenda}" The text is: "${text}". Please provide a relevance score from 1 to 10 and just provide me the score no other information is required only need an integer.`;

    try {
      console.log({ gptResponse }, "calling gpt response");

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
      const gptResponse = result.data.choices[0].message.content;
      console.log({ gptResponse }, " gpt response");
      setResponse(gptResponse);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      setResponse("There was an error while fetching the response.");
    }

    setLoading(false);
  };

  return (
    <div>
      <div>
        <label>
          Topic:
          <input
            type="text"
            value={topic}
            className="bg-white"
            placeholder="Enter your topic"
          />
        </label>
      </div>

      <div>
        <label>
          Text:
          <textarea
            value={text}
            // onChange={(e)=> setText(e.target.value) }
            className="bg-white"
            placeholder="Enter the text to evaluate"
          />
        </label>
      </div>

      <div>
        <button
          className="border bg-white"
          onClick={checkRelevance}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Relevance"}
        </button>
      </div>

      {response && (
        <div>
          <h2>Relevance Evaluation</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatGPTRelevanceChecker;
