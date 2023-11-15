import React, { useState, useEffect } from "react";
import AudioRecorder from "./AudioFile";
import FillerWordsHighlighter from "./FillerWordsHighlighter";
import "./App.css";
import TimeSeriesPlot from "./TimeSeriesPlot";

const ExpandableList = ({ title, items }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <div onClick={() => setIsExpanded(!isExpanded)} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }} className={`expandable-list ${isExpanded ? "expanded" : ""}`}>
      <p>
        {title}
      </p>
      <p>
      {isExpanded ? "-" : "+"}
      </p>
      </div>
      {isExpanded && (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
  const [isRecording, setIsRecording] = useState(false);
  const [timeSeries, setTimeSeries] = useState([]);
  const [fillerScores, setFillerScores] = useState([]);


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
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          setTimeSeries={setTimeSeries}
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
          <div style={{textAlign: 'center', fontSize: '1.5rem'}}>ROADMAP (click to expand)</div>
      <ExpandableList
        title="Known issues:"
        items={[
          "awkward button styling on clear prompts if hovering",
          "need word break on user-defined filler words",
          "no form id's",
        ]}
      />
      <ExpandableList
        title="Will add:"
        items={["light/dark theme", "time stamps for each sentence (start/stop)"]}
      />
      <ExpandableList
        title="Future plans:"
        items={[
          "add global prompts for questions/pages for subjects with questions",
          "allow people to listen to other people's responses, give feedback, rate response",
          "accounts with leaderboards/score",
          "share screen capability? / embedded facecam?",
        ]}
      />
    </div>
      </div>
      <div className="container">
        {/* add New component here that takes in the same props as the one below then uses recharts */}
        <TimeSeriesPlot 
                  finished={isRecording}
                  fillerScores={fillerScores}
                  timeSeries={timeSeries}
        />
        <FillerWordsHighlighter
          transcriptions={transcriptions}
          confidences={confidences}
          finished={isRecording}
          timeSeries={timeSeries}
          fillerScores={fillerScores}
          setFillerScores={setFillerScores}
        />
      </div>
    </div>
  );
}

export default App;
