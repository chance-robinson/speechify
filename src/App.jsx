// App.jsx

import React, { useState } from 'react';
import AudioRecorder from './AudioFile';
import './App.css';

function App() {
  // State to store the max recording duration
  const [maxDuration, setMaxDuration] = useState(60); // Default to 60 seconds, for example
  const [prompt, setPrompt] = useState('');

  return (
    <div className="container">
      <div className="prompt-container">
        <label className="prompt-label">
          Prompt:
          <textarea
            className="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </label>
      </div>
      <div className="duration-container">
        <label className="duration-label">
          Max Recording Duration (seconds):
          <input
            className="duration-input"
            type="number"
            value={maxDuration}
            onChange={(e) => setMaxDuration(parseInt(e.target.value, 10))}
          />
        </label>
      </div>
      <AudioRecorder maxRecordingDuration={maxDuration * 1000 + 100} />
    </div>
  );
}

export default App;
