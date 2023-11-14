import React, { useState, useEffect } from "react";
import AudioRecorder from "./AudioFile";
import FillerWordsHighlighter from "./FillerWordsHighlighter";
import "./App.css";

function App() {
  // State to store the max recording duration, prompt, transcriptions, and confidences
  const [maxDuration, setMaxDuration] = useState(60); // Default to 60 seconds, for example
  const [useMaxDuration, setUseMaxDuration] = useState(false);
  const [prompt, setPrompt] = useState(() => {
    // Initialize with the value from local storage, or an empty string if not present
    const storedPrompt = localStorage.getItem("prompt");
    return storedPrompt ? storedPrompt : "";
  });
  const [transcriptions, setTranscriptions] = useState([]);
  const [confidences, setConfidences] = useState([]);

  const clearPrompt = () => {
    setPrompt("");
  };

  useEffect(() => {
    // Save the current prompt value to local storage
    localStorage.setItem("prompt", prompt);
  }, [prompt]);

  const calculateRows = (text) => {
    // Calculate the number of rows based on the content
    const lineCount = (text.match(/\n/g) || []).length + 1;
    return Math.min(Math.max(lineCount, 4)); // Adjust as needed
  };

  return (
    <div className="home">
      <div className="container">
        <div className="duration-container">
          <label className="duration-label">
            Max Recording Duration (seconds):
            <input
              className="duration-input"
              type="number"
              value={maxDuration}
              onChange={(e) => setMaxDuration(parseInt(e.target.value, 10))}
              disabled={!useMaxDuration}
            />
          </label>
          <label className="duration-label">
            <input
              className="duration-input"
              type="checkbox"
              checked={useMaxDuration}
              onChange={() => setUseMaxDuration(!useMaxDuration)}
            />
          </label>
        </div>
        <AudioRecorder
          maxRecordingDuration={
            useMaxDuration ? maxDuration * 1000 + 100 : Infinity
          }
          setTranscriptions={setTranscriptions}
          setConfidences={setConfidences}
          infinitePlay={!useMaxDuration}
        />
        <div className="prompt-container">
          <label className="prompt-label">
            <div
              className="prompt-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
                marginBottom: "1rem",
              }}
            >
              <p>Prompts:</p>
              <button
                onClick={clearPrompt}
                style={{ marginLeft: "10px" }}
                disabled={!prompt}
              >
                Clear Prompts
              </button>
            </div>
            <textarea
              className="prompt-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={calculateRows(prompt)}
              placeholder="put some prompts to practice on in here"
              style={{ resize: "vertical" }}
            />
          </label>
        </div>
        <div className="bottom-container">
        <div>
          <p>Known issues:</p>
          <ul>
            <li>
              user-defined filler words containing single-letter words will get
              caught in sentences 'i' 'a' any partial word, need to make exact.
            </li>
            <li>awkward button styling on clear prompts if hovering</li>
            <li>need word break on user-defined filler words</li>
            <li>no form id's</li>
          </ul>
        </div>
        <div>
          <p>Will add:</p>
          <ul>
            <li>light/dark theme</li>
            <li>time stamps for each sentence (start/stop)</li>
          </ul>
        </div>
        <div>
          <p>future plans:</p>
          <ul>
            <li>add global prompts for questions/ pages for subjects with questions</li>
            <li>allow people to listen to other peoples responses, give feedback, rate response</li>
            <li>accounts with leaderboards/score</li>
            <li>share screen capability? / embedded facecam?</li>
          </ul>
        </div>
      </div>
      </div>
      <div className="container">
        <FillerWordsHighlighter
          transcriptions={transcriptions}
          confidences={confidences}
        />
      </div>
    </div>
  );
}

export default App;
